package ogp

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/chromedp/chromedp"
)

type OGPData struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Image       string `json:"image"`
	SiteName    string `json:"siteName"`
	URL         string `json:"url"`
	Platform    string `json:"platform"`
}

// Handler は OGP 取得エンドポイント
func Handler(w http.ResponseWriter, r *http.Request) {
	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		http.Error(w, "url parameter is required", http.StatusBadRequest)
		return
	}

	ogp, err := Fetch(targetURL)
	if err != nil {
		log.Printf("OGP fetch error: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ogp)
}

// Fetch は指定URLからOGP情報を取得
func Fetch(targetURL string) (*OGPData, error) {
	platform := detectPlatform(targetURL, "")

	var ogp *OGPData
	var err error

	// YouTube は直接取得（高速）
	if platform == "YouTube" {
		ogp, err = fetchYouTube(targetURL)
	} else if platform == "TikTok" || platform == "X" || platform == "Instagram" {
		// chromedp を使用
		ogp, err = fetchWithChrome(targetURL)
		if err != nil {
			log.Printf("Chrome fetch failed for %s: %v, falling back to generic", platform, err)
			ogp, err = fetchGeneric(targetURL)
		}
	} else {
		ogp, err = fetchGeneric(targetURL)
	}

	if err != nil {
		return nil, err
	}

	// Instagram/TikTok/X の画像はプロキシ経由に変換
	if ogp != nil && ogp.Image != "" {
		if platform == "Instagram" || platform == "TikTok" || platform == "X" {
			ogp.Image = "/api/image-proxy?url=" + url.QueryEscape(ogp.Image)
		}
	}

	if ogp != nil {
		ogp.Platform = platform
	}

	return ogp, nil
}

// fetchWithChrome は chromedp を使ってOGP情報を取得
func fetchWithChrome(targetURL string) (*OGPData, error) {
	// chromedp のオプション設定
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-dev-shm-usage", true),
		chromedp.Flag("disable-setuid-sandbox", true),
		chromedp.Flag("single-process", true),
		chromedp.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
	)

	allocCtx, allocCancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer allocCancel()

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	// タイムアウト設定
	ctx, cancel = context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	var html string
	err := chromedp.Run(ctx,
		chromedp.Navigate(targetURL),
		chromedp.Sleep(3*time.Second), // ページ読み込み待機
		chromedp.OuterHTML("html", &html),
	)
	if err != nil {
		return nil, err
	}

	ogp := &OGPData{URL: targetURL}

	// OGPタグを抽出
	ogp.Title = extractMeta(html, "og:title")
	if ogp.Title == "" {
		ogp.Title = extractMeta(html, "twitter:title")
	}
	if ogp.Title == "" {
		ogp.Title = extractTitle(html)
	}

	ogp.Description = extractMeta(html, "og:description")
	if ogp.Description == "" {
		ogp.Description = extractMeta(html, "twitter:description")
	}

	ogp.Image = extractMeta(html, "og:image")
	if ogp.Image == "" {
		ogp.Image = extractMeta(html, "twitter:image")
	}
	if ogp.Image == "" {
		ogp.Image = extractMeta(html, "twitter:image:src")
	}

	ogp.SiteName = extractMeta(html, "og:site_name")
	ogp.Platform = detectPlatform(targetURL, ogp.SiteName)

	return ogp, nil
}

// fetchYouTube は YouTube の情報を取得
func fetchYouTube(targetURL string) (*OGPData, error) {
	videoID := extractYouTubeID(targetURL)
	if videoID == "" {
		return fetchGeneric(targetURL)
	}

	ogp := &OGPData{
		URL:      targetURL,
		Platform: "YouTube",
		Image:    "https://img.youtube.com/vi/" + videoID + "/maxresdefault.jpg",
	}

	// oEmbed でタイトルを取得
	oembedURL := "https://www.youtube.com/oembed?url=" + url.QueryEscape(targetURL) + "&format=json"
	oembed, err := fetchOEmbed(oembedURL)
	if err == nil && oembed != nil {
		ogp.Title = oembed.Title
		if oembed.AuthorName != "" {
			ogp.Description = "by " + oembed.AuthorName
		}
	}

	return ogp, nil
}

// oEmbed レスポンス構造体
type OEmbedResponse struct {
	Title        string `json:"title"`
	AuthorName   string `json:"author_name"`
	ThumbnailURL string `json:"thumbnail_url"`
	ProviderName string `json:"provider_name"`
}

// fetchOEmbed は oEmbed API からデータを取得
func fetchOEmbed(oembedURL string) (*OEmbedResponse, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	req, err := http.NewRequest("GET", oembedURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, nil
	}

	var oembed OEmbedResponse
	if err := json.NewDecoder(resp.Body).Decode(&oembed); err != nil {
		return nil, err
	}

	return &oembed, nil
}

// fetchGeneric は通常のHTTPリクエストでOGP取得
func fetchGeneric(targetURL string) (*OGPData, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	buf := make([]byte, 1024*1024) // 1MB limit
	n, _ := resp.Body.Read(buf)
	html := string(buf[:n])

	ogp := &OGPData{URL: targetURL}

	ogp.Title = extractMeta(html, "og:title")
	if ogp.Title == "" {
		ogp.Title = extractMeta(html, "twitter:title")
	}
	if ogp.Title == "" {
		ogp.Title = extractTitle(html)
	}

	ogp.Description = extractMeta(html, "og:description")
	if ogp.Description == "" {
		ogp.Description = extractMeta(html, "twitter:description")
	}

	ogp.Image = extractMeta(html, "og:image")
	if ogp.Image == "" {
		ogp.Image = extractMeta(html, "twitter:image")
	}

	ogp.SiteName = extractMeta(html, "og:site_name")
	ogp.Platform = detectPlatform(targetURL, ogp.SiteName)

	return ogp, nil
}

// extractMeta はHTMLからmetaタグの内容を抽出
func extractMeta(html, property string) string {
	patterns := []string{
		`<meta[^>]+property=["']` + regexp.QuoteMeta(property) + `["'][^>]+content=["']([^"']+)["']`,
		`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']` + regexp.QuoteMeta(property) + `["']`,
		`<meta[^>]+name=["']` + regexp.QuoteMeta(property) + `["'][^>]+content=["']([^"']+)["']`,
		`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']` + regexp.QuoteMeta(property) + `["']`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(`(?i)` + pattern)
		matches := re.FindStringSubmatch(html)
		if len(matches) > 1 {
			return strings.TrimSpace(decodeHTMLEntities(matches[1]))
		}
	}

	return ""
}

// extractTitle はHTMLから<title>タグを抽出
func extractTitle(html string) string {
	re := regexp.MustCompile(`(?i)<title[^>]*>([^<]+)</title>`)
	matches := re.FindStringSubmatch(html)
	if len(matches) > 1 {
		return strings.TrimSpace(matches[1])
	}
	return ""
}

// detectPlatform はURLからプラットフォームを判定
func detectPlatform(targetURL, siteName string) string {
	u, err := url.Parse(targetURL)
	if err != nil {
		return siteName
	}

	host := strings.ToLower(u.Host)

	switch {
	case strings.Contains(host, "youtube.com") || strings.Contains(host, "youtu.be"):
		return "YouTube"
	case strings.Contains(host, "tiktok.com"):
		return "TikTok"
	case strings.Contains(host, "instagram.com"):
		return "Instagram"
	case strings.Contains(host, "twitter.com") || strings.Contains(host, "x.com"):
		return "X"
	case strings.Contains(host, "cookpad.com"):
		return "クックパッド"
	case strings.Contains(host, "kurashiru.com"):
		return "クラシル"
	case strings.Contains(host, "delishkitchen.tv"):
		return "DELISH KITCHEN"
	case strings.Contains(host, "macaroni.com"):
		return "macaroni"
	default:
		if siteName != "" {
			return siteName
		}
		return host
	}
}

// extractYouTubeID はYouTube URLから動画IDを抽出
func extractYouTubeID(targetURL string) string {
	patterns := []string{
		`youtube\.com/watch\?v=([a-zA-Z0-9_-]+)`,
		`youtu\.be/([a-zA-Z0-9_-]+)`,
		`youtube\.com/embed/([a-zA-Z0-9_-]+)`,
		`youtube\.com/shorts/([a-zA-Z0-9_-]+)`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(targetURL)
		if len(matches) > 1 {
			return matches[1]
		}
	}

	return ""
}


func ImageProxyHandler(w http.ResponseWriter, r *http.Request) {
	imageURL := r.URL.Query().Get("url")
	if imageURL == "" {
		http.Error(w, "url parameter is required", http.StatusBadRequest)
		return
	}

	// URLデコード
	decodedURL, err := url.QueryUnescape(imageURL)
	if err != nil {
		decodedURL = imageURL
	}

	client := &http.Client{Timeout: 15 * time.Second}

	req, err := http.NewRequest("GET", decodedURL, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// ブラウザとして振る舞う
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8")
	req.Header.Set("Referer", "https://www.instagram.com/")

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Failed to fetch image", resp.StatusCode)
		return
	}

	// Content-Type をコピー
	contentType := resp.Header.Get("Content-Type")
	if contentType != "" {
		w.Header().Set("Content-Type", contentType)
	} else {
		w.Header().Set("Content-Type", "image/jpeg")
	}

	// キャッシュヘッダー
	w.Header().Set("Cache-Control", "public, max-age=86400") // 24時間キャッシュ

	// 画像データを返す
	io.Copy(w, resp.Body)
}

func decodeHTMLEntities(s string) string {
	replacer := strings.NewReplacer(
		"&amp;", "&",
		"&lt;", "<",
		"&gt;", ">",
		"&quot;", `"`,
		"&#39;", "'",
	)
	return replacer.Replace(s)
}
