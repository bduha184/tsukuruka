package graph

import (
	"context"
	"errors"
	"time"

	"github.com/bduha184/tsukuruka/auth"
	"github.com/bduha184/tsukuruka/graph/model"
)

// getUserID はコンテキストからユーザーIDを取得
func getUserID(ctx context.Context) (string, error) {
	user := auth.GetUserFromContext(ctx)
	if user == nil {
		return "", errors.New("unauthorized: please login")
	}
	return user.UserID, nil
}

// CreateRecipe is the resolver for the createRecipe field.
func (r *mutationResolver) CreateRecipe(ctx context.Context, input model.CreateRecipeInput) (*model.Recipe, error) {
	userID, err := getUserID(ctx)
	if err != nil {
		return nil, err
	}

	// カテゴリから外食コストを取得
	var eatingOutCost *int
	if input.CategoryID != nil {
		var cost int
		err := r.DB.QueryRow(ctx, "SELECT eating_out_cost FROM categories WHERE id = $1", *input.CategoryID).Scan(&cost)
		if err == nil {
			eatingOutCost = &cost
		}
	}

	query := `
		INSERT INTO recipes (user_id, url, title, thumbnail_url, platform, category_id, estimated_cost, eating_out_cost)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, status, created_at, updated_at
	`

	var recipe model.Recipe
	recipe.URL = input.URL
	recipe.Title = input.Title
	recipe.ThumbnailURL = input.ThumbnailURL
	recipe.Platform = input.Platform
	recipe.EstimatedCost = input.EstimatedCost
	recipe.EatingOutCost = eatingOutCost

	var status string
	err = r.DB.QueryRow(ctx, query,
		userID, input.URL, input.Title, input.ThumbnailURL, input.Platform,
		input.CategoryID, input.EstimatedCost, eatingOutCost,
	).Scan(&recipe.ID, &status, &recipe.CreatedAt, &recipe.UpdatedAt)

	if err != nil {
		return nil, err
	}

	recipe.Status = model.RecipeStatus(status)

	// カテゴリ情報を取得
	if input.CategoryID != nil {
		var cat model.Category
		err := r.DB.QueryRow(ctx, "SELECT id, name, icon, eating_out_cost FROM categories WHERE id = $1", *input.CategoryID).
			Scan(&cat.ID, &cat.Name, &cat.Icon, &cat.EatingOutCost)
		if err == nil {
			recipe.Category = &cat
		}
	}

	return &recipe, nil
}

// UpdateRecipeStatus is the resolver for the updateRecipeStatus field.
func (r *mutationResolver) UpdateRecipeStatus(ctx context.Context, id string, status model.RecipeStatus) (*model.Recipe, error) {
	userID, err := getUserID(ctx)
	if err != nil {
		return nil, err
	}

	query := `
		UPDATE recipes SET status = $1, updated_at = NOW()
		WHERE id = $2 AND user_id = $3
		RETURNING id, url, title, thumbnail_url, platform, category_id, estimated_cost, eating_out_cost, status, suggested_at::text, created_at, updated_at
	`

	var recipe model.Recipe
	var categoryID *string
	var statusStr string
	err = r.DB.QueryRow(ctx, query, status.String(), id, userID).Scan(
		&recipe.ID, &recipe.URL, &recipe.Title, &recipe.ThumbnailURL, &recipe.Platform,
		&categoryID, &recipe.EstimatedCost, &recipe.EatingOutCost, &statusStr, &recipe.SuggestedAt,
		&recipe.CreatedAt, &recipe.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	recipe.Status = model.RecipeStatus(statusStr)

	// カテゴリ情報を取得
	if categoryID != nil {
		var cat model.Category
		err := r.DB.QueryRow(ctx, "SELECT id, name, icon, eating_out_cost FROM categories WHERE id = $1", *categoryID).
			Scan(&cat.ID, &cat.Name, &cat.Icon, &cat.EatingOutCost)
		if err == nil {
			recipe.Category = &cat
		}
	}

	return &recipe, nil
}

// DeleteRecipe is the resolver for the deleteRecipe field.
func (r *mutationResolver) DeleteRecipe(ctx context.Context, id string) (bool, error) {
	userID, err := getUserID(ctx)
	if err != nil {
		return false, err
	}

	query := `UPDATE recipes SET status = 'DELETED', updated_at = NOW() WHERE id = $1 AND user_id = $2`
	result, err := r.DB.Exec(ctx, query, id, userID)
	if err != nil {
		return false, err
	}
	return result.RowsAffected() > 0, nil
}

// SkipRecipeToday is the resolver for the skipRecipeToday field.
func (r *mutationResolver) SkipRecipeToday(ctx context.Context, id string) (*model.Recipe, error) {
	userID, err := getUserID(ctx)
	if err != nil {
		return nil, err
	}

	query := `
		UPDATE recipes SET suggested_at = CURRENT_DATE, updated_at = NOW()
		WHERE id = $1 AND user_id = $2
		RETURNING id, url, title, thumbnail_url, platform, category_id, estimated_cost, eating_out_cost, status, suggested_at::text, created_at, updated_at
	`

	var recipe model.Recipe
	var categoryID *string
	var statusStr string
	err = r.DB.QueryRow(ctx, query, id, userID).Scan(
		&recipe.ID, &recipe.URL, &recipe.Title, &recipe.ThumbnailURL, &recipe.Platform,
		&categoryID, &recipe.EstimatedCost, &recipe.EatingOutCost, &statusStr, &recipe.SuggestedAt,
		&recipe.CreatedAt, &recipe.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	recipe.Status = model.RecipeStatus(statusStr)

	// カテゴリ情報を取得
	if categoryID != nil {
		var cat model.Category
		err := r.DB.QueryRow(ctx, "SELECT id, name, icon, eating_out_cost FROM categories WHERE id = $1", *categoryID).
			Scan(&cat.ID, &cat.Name, &cat.Icon, &cat.EatingOutCost)
		if err == nil {
			recipe.Category = &cat
		}
	}

	return &recipe, nil
}

// Health is the resolver for the health field.
func (r *queryResolver) Health(ctx context.Context) (*model.Health, error) {
	dbStatus := "disconnected"
	if r.DB != nil {
		if err := r.DB.Ping(ctx); err == nil {
			dbStatus = "connected"
		}
	}

	return &model.Health{
		Status:    "ok",
		Database:  dbStatus,
		Timestamp: time.Now(),
	}, nil
}

// Categories is the resolver for the categories field.
func (r *queryResolver) Categories(ctx context.Context) ([]*model.Category, error) {
	rows, err := r.DB.Query(ctx, "SELECT id, name, icon, eating_out_cost FROM categories ORDER BY eating_out_cost DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []*model.Category
	for rows.Next() {
		var c model.Category
		if err := rows.Scan(&c.ID, &c.Name, &c.Icon, &c.EatingOutCost); err != nil {
			return nil, err
		}
		categories = append(categories, &c)
	}

	return categories, nil
}

// Recipes is the resolver for the recipes field.
func (r *queryResolver) Recipes(ctx context.Context, status *model.RecipeStatus) ([]*model.Recipe, error) {
	userID, err := getUserID(ctx)
	if err != nil {
		return nil, err
	}

	query := `
		SELECT r.id, r.url, r.title, r.thumbnail_url, r.platform,
		       r.estimated_cost, r.eating_out_cost, r.status, r.suggested_at::text,
		       r.created_at, r.updated_at,
		       c.id, c.name, c.icon, c.eating_out_cost
		FROM recipes r
		LEFT JOIN categories c ON r.category_id = c.id
		WHERE r.user_id = $1
	`
	args := []interface{}{userID}

	if status != nil {
		query += " AND r.status = $2"
		args = append(args, status.String())
	}
	query += " ORDER BY r.created_at DESC"

	rows, err := r.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var recipes []*model.Recipe
	for rows.Next() {
		var recipe model.Recipe
		var catID, catName, catIcon *string
		var catCost *int
		var statusStr string

		err := rows.Scan(
			&recipe.ID, &recipe.URL, &recipe.Title, &recipe.ThumbnailURL, &recipe.Platform,
			&recipe.EstimatedCost, &recipe.EatingOutCost, &statusStr, &recipe.SuggestedAt,
			&recipe.CreatedAt, &recipe.UpdatedAt,
			&catID, &catName, &catIcon, &catCost,
		)
		if err != nil {
			return nil, err
		}

		recipe.Status = model.RecipeStatus(statusStr)

		if catID != nil {
			recipe.Category = &model.Category{
				ID:            *catID,
				Name:          *catName,
				Icon:          *catIcon,
				EatingOutCost: *catCost,
			}
		}

		recipes = append(recipes, &recipe)
	}

	return recipes, nil
}

// Recipe is the resolver for the recipe field.
func (r *queryResolver) Recipe(ctx context.Context, id string) (*model.Recipe, error) {
	userID, err := getUserID(ctx)
	if err != nil {
		return nil, err
	}

	query := `
		SELECT r.id, r.url, r.title, r.thumbnail_url, r.platform,
		       r.estimated_cost, r.eating_out_cost, r.status, r.suggested_at::text,
		       r.created_at, r.updated_at,
		       c.id, c.name, c.icon, c.eating_out_cost
		FROM recipes r
		LEFT JOIN categories c ON r.category_id = c.id
		WHERE r.id = $1 AND r.user_id = $2
	`

	var recipe model.Recipe
	var catID, catName, catIcon *string
	var catCost *int
	var statusStr string

	err = r.DB.QueryRow(ctx, query, id, userID).Scan(
		&recipe.ID, &recipe.URL, &recipe.Title, &recipe.ThumbnailURL, &recipe.Platform,
		&recipe.EstimatedCost, &recipe.EatingOutCost, &statusStr, &recipe.SuggestedAt,
		&recipe.CreatedAt, &recipe.UpdatedAt,
		&catID, &catName, &catIcon, &catCost,
	)
	if err != nil {
		return nil, err
	}

	recipe.Status = model.RecipeStatus(statusStr)

	if catID != nil {
		recipe.Category = &model.Category{
			ID:            *catID,
			Name:          *catName,
			Icon:          *catIcon,
			EatingOutCost: *catCost,
		}
	}

	return &recipe, nil
}

// TodayRecipe is the resolver for the todayRecipe field.
func (r *queryResolver) TodayRecipe(ctx context.Context) (*model.Recipe, error) {
	userID, err := getUserID(ctx)
	if err != nil {
		return nil, err
	}

	// suggested_at が今日でない SAVED レシピを取得
	query := `
		SELECT r.id, r.url, r.title, r.thumbnail_url, r.platform,
		       r.estimated_cost, r.eating_out_cost, r.status, r.suggested_at::text,
		       r.created_at, r.updated_at,
		       c.id, c.name, c.icon, c.eating_out_cost
		FROM recipes r
		LEFT JOIN categories c ON r.category_id = c.id
		WHERE r.user_id = $1
		  AND r.status = 'SAVED'
		  AND (r.suggested_at IS NULL OR r.suggested_at < CURRENT_DATE)
		ORDER BY RANDOM()
		LIMIT 1
	`

	var recipe model.Recipe
	var catID, catName, catIcon *string
	var catCost *int
	var statusStr string

	err = r.DB.QueryRow(ctx, query, userID).Scan(
		&recipe.ID, &recipe.URL, &recipe.Title, &recipe.ThumbnailURL, &recipe.Platform,
		&recipe.EstimatedCost, &recipe.EatingOutCost, &statusStr, &recipe.SuggestedAt,
		&recipe.CreatedAt, &recipe.UpdatedAt,
		&catID, &catName, &catIcon, &catCost,
	)
	if err != nil {
		return nil, nil // レシピがない場合はnull
	}

	recipe.Status = model.RecipeStatus(statusStr)

	if catID != nil {
		recipe.Category = &model.Category{
			ID:            *catID,
			Name:          *catName,
			Icon:          *catIcon,
			EatingOutCost: *catCost,
		}
	}

	return &recipe, nil
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
