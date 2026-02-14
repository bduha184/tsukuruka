package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/bduha184/tsukuruka/auth"
	"github.com/bduha184/tsukuruka/graph"
	"github.com/bduha184/tsukuruka/ogp"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// Database connection
	var db *pgxpool.Pool
	dbURL := os.Getenv("SUPABASE_DB_URL")
	if dbURL == "" {
		dbURL = os.Getenv("DATABASE_URL")
	}
	if dbURL != "" {
		var err error
		db, err = pgxpool.New(context.Background(), dbURL)
		if err != nil {
			log.Printf("⚠️  Database connection failed: %v", err)
		} else {
			if err := db.Ping(context.Background()); err != nil {
				log.Printf("⚠️  Database ping failed: %v", err)
			} else {
				log.Println("✅ Database connected")
			}
			defer db.Close()
		}
	}

	// Router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// Auth middleware
	r.Use(auth.Middleware)

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// OGP endpoint
	r.Get("/api/ogp", ogp.Handler)
	r.Get("/api/image-proxy", ogp.ImageProxyHandler)  // ← 追加

	// GraphQL
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{
		Resolvers: &graph.Resolver{DB: db},
	}))
	r.Handle("/", playground.Handler("GraphQL playground", "/query"))
	r.Handle("/query", srv)

	log.Printf("🚀 Server ready at http://localhost:%s/", port)
	log.Printf("📊 GraphQL Playground: http://localhost:%s/", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
