package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/bduha184/tsukuruka/graph"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
)

var db *pgxpool.Pool

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// Database connection
	dbURL := os.Getenv("DATABASE_URL")
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
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// REST endpoints
	r.Get("/health", healthHandler)
	r.Get("/api/categories", categoriesHandler)

	// GraphQL
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))
	r.Handle("/", playground.Handler("GraphQL playground", "/query"))
	r.Handle("/query", srv)

	log.Printf("🚀 Server ready at http://localhost:%s/", port)
	log.Printf("📊 GraphQL Playground: http://localhost:%s/", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	dbStatus := "disconnected"
	if db != nil {
		if err := db.Ping(r.Context()); err == nil {
			dbStatus = "connected"
		}
	}

	response := map[string]interface{}{
		"status":    "ok",
		"database":  dbStatus,
		"timestamp": time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func categoriesHandler(w http.ResponseWriter, r *http.Request) {
	if db == nil {
		http.Error(w, "Database not connected", http.StatusServiceUnavailable)
		return
	}

	rows, err := db.Query(r.Context(), "SELECT id, name, icon, eating_out_cost FROM categories ORDER BY eating_out_cost DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var categories []map[string]interface{}
	for rows.Next() {
		var id, name, icon string
		var eatingOutCost int
		if err := rows.Scan(&id, &name, &icon, &eatingOutCost); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		categories = append(categories, map[string]interface{}{
			"id":            id,
			"name":          name,
			"icon":          icon,
			"eatingOutCost": eatingOutCost,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}
