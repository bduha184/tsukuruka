package ogp

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
)

type OGPData struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	Image        string `json:"image"`
	SiteName     string `json:"siteName"`
	URL          string `json:"url"`
	Platform     string `json:"platform"`
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
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ogp)
}

// Fetch は指定URLからOGP情報を取得
func Fetch(targetURL string) (*OGPData, error) {
	// HTTPリクエスト
	client := &http.Client{}
	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return nil, err
	}

	// ブラウザとして振る舞う
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	html := string(body)
	ogp := &OGPData{URL: targetURL}

	// OGPタグを抽出
	ogp.Title = extractMeta(html, "og:title")
	if ogp.Title == "" {
		ogp.Title = extractTitle(html)
	}

	ogp.Description = extractMeta(html, "og:description")
	ogp.Image = extractMeta(html, "og:image")
	ogp.SiteName = extractMeta(html, "og:site_name")

	// プラットフォームを判定
	ogp.Platform = detectPlatform(targetURL, ogp.SiteName)

	// YouTube の場合、高解像度サムネイルを取得
	if ogp.Platform == "YouTube" {
		if videoID := extractYouTubeID(targetURL); videoID != "" {
			ogp.Image = "https://img.youtube.com/vi/" + videoID + "/maxresdefault.jpg"
		}
	}

	return ogp, nil
}

// extractMeta はHTMLからmetaタグの内容を抽出
func extractMeta(html, property string) string {
	// og:xxx または name="xxx" を検索
	patterns := []string{
		`<meta[^>]+property=["']` + regexp.QuoteMeta(property) + `["'][^>]+content=["']([^"']+)["']`,
		`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']` + regexp.QuoteMeta(property) + `["']`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(html)
		if len(matches) > 1 {
			return strings.TrimSpace(matches[1])
		}
	}

	return ""
}

// extractTitle はHTMLから<title>タグを抽出
func extractTitle(html string) string {
	re := regexp.MustCompile(`<title[^>]*>([^<]+)</title>`)
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
