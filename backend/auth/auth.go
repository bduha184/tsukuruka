package auth

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/MicahParks/keyfunc/v2"
	"github.com/golang-jwt/jwt/v5"
)

var (
	jwks     *keyfunc.JWKS
	jwksOnce sync.Once
	jwksErr  error
)

// initJWKS は JWKS を遅延初期化
func initJWKS() (*keyfunc.JWKS, error) {
	jwksOnce.Do(func() {
		supabaseURL := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
		if supabaseURL == "" {
			supabaseURL = "https://bnrmblkljryoeaxjrbfi.supabase.co"
		}

		jwksURL := supabaseURL + "/auth/v1/.well-known/jwks.json"
		log.Printf("🔐 Loading JWKS from: %s", jwksURL)

		jwks, jwksErr = keyfunc.Get(jwksURL, keyfunc.Options{
			RefreshInterval: time.Hour,
			RefreshTimeout:  30 * time.Second,
		})

		if jwksErr != nil {
			log.Printf("⚠️  Failed to load JWKS: %v", jwksErr)
		} else {
			log.Println("✅ JWKS loaded successfully")
		}
	})

	return jwks, jwksErr
}

// Claims はSupabase JWTのペイロード
type Claims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

// UserContext はコンテキストに格納するユーザー情報
type UserContext struct {
	UserID string
	Email  string
}

type contextKey string

const userContextKey contextKey = "user"

// ValidateSupabaseToken はSupabaseのJWTトークンを検証
func ValidateSupabaseToken(tokenString string) (*Claims, error) {
	jwksInstance, err := initJWKS()
	if err != nil {
		return nil, err
	}
	if jwksInstance == nil {
		return nil, errors.New("JWKS not available")
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, jwksInstance.Keyfunc)
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// Middleware は認証ミドルウェア
func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			next.ServeHTTP(w, r)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			next.ServeHTTP(w, r)
			return
		}

		claims, err := ValidateSupabaseToken(parts[1])
		if err != nil {
			log.Printf("🔐 Token validation error: %v", err)
			next.ServeHTTP(w, r)
			return
		}

		log.Printf("🔐 Authenticated user: %s (%s)", claims.Sub, claims.Email)

		ctx := context.WithValue(r.Context(), userContextKey, &UserContext{
			UserID: claims.Sub,
			Email:  claims.Email,
		})

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserFromContext はコンテキストからユーザー情報を取得
func GetUserFromContext(ctx context.Context) *UserContext {
	if user, ok := ctx.Value(userContextKey).(*UserContext); ok {
		return user
	}
	return nil
}
