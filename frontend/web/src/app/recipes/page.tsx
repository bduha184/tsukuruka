"use client";

import RecipeImage from "@/components/RecipeImage";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { RECIPES_QUERY, DELETE_RECIPE_MUTATION } from "@/lib/graphql";
import { Recipe } from "@/types/graphql";

export default function RecipesPage() {
  const router = useRouter();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, loading } = useQuery<{ recipes: Recipe[] }>(RECIPES_QUERY);

  const [deleteRecipe] = useMutation(DELETE_RECIPE_MUTATION, {
    refetchQueries: [{ query: RECIPES_QUERY }],
  });

  const recipes = data?.recipes?.filter((r) => r.status !== "DELETED") || [];
  const savedRecipes = recipes.filter((r) => r.status === "SAVED");
  const cookedRecipes = recipes.filter((r) => r.status === "COOKED");

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleDelete = async () => {
    try {
      for (const id of selectedIds) {
        await deleteRecipe({ variables: { id } });
      }
      setSelectedIds([]);
      setSelectMode(false);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting recipes:", error);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Header title="料理一覧" />
        <main style={styles.main}>
          <p style={styles.loading}>読み込み中...</p>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header title="料理一覧" />
      <main style={styles.main}>
        {recipes.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📋</span>
            <h2 style={styles.emptyTitle}>料理がありません</h2>
            <p style={styles.emptyText}>料理を登録して始めましょう</p>
            <button
              onClick={() => router.push("/register")}
              style={styles.primaryButton}
            >
              料理を登録する
            </button>
          </div>
        ) : (
          <>
            {/* 選択モードトグル */}
            <div style={styles.toolbar}>
              <button
                onClick={() => {
                  setSelectMode(!selectMode);
                  setSelectedIds([]);
                }}
                style={styles.toolbarButton}
              >
                {selectMode ? "キャンセル" : "選択"}
              </button>
              {selectMode && selectedIds.length > 0 && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  style={styles.deleteButton}
                >
                  削除 ({selectedIds.length})
                </button>
              )}
            </div>

            {/* これから作る */}
            {savedRecipes.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>🍳 これから作る</h2>
                <div style={styles.recipeList}>
                  {savedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      selectMode={selectMode}
                      selected={selectedIds.includes(recipe.id)}
                      onSelect={() => toggleSelect(recipe.id)}
                      onClick={() =>
                        !selectMode && router.push(`/recipes/${recipe.id}`)
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 作った料理 */}
            {cookedRecipes.length > 0 && (
              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>✅ 作った料理</h2>
                <div style={styles.recipeList}>
                  {cookedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      selectMode={selectMode}
                      selected={selectedIds.includes(recipe.id)}
                      onSelect={() => toggleSelect(recipe.id)}
                      onClick={() =>
                        !selectMode && router.push(`/recipes/${recipe.id}`)
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />

      {/* 削除確認ダイアログ */}
      {showDeleteDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialog}>
            <h3 style={styles.dialogTitle}>削除しますか？</h3>
            <p style={styles.dialogText}>
              {selectedIds.length}件の料理を削除します。
              <br />
              削除した料理は「削除した料理」から復元できます。
            </p>
            <div style={styles.dialogActions}>
              <button
                onClick={() => setShowDeleteDialog(false)}
                style={styles.dialogCancelButton}
              >
                キャンセル
              </button>
              <button onClick={handleDelete} style={styles.dialogDeleteButton}>
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// レシピカードコンポーネント
interface RecipeCardProps {
  recipe: Recipe;
  selectMode: boolean;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
}

function RecipeCard({
  recipe,
  selectMode,
  selected,
  onSelect,
  onClick,
}: RecipeCardProps) {
  return (
    <div
      style={{
        ...styles.recipeCard,
        ...(selected ? styles.recipeCardSelected : {}),
      }}
      onClick={selectMode ? onSelect : onClick}
    >
      {selectMode && (
        <div style={styles.checkbox}>{selected && <span>✓</span>}</div>
      )}
      <div style={styles.recipeCardThumbnail}>
        <RecipeImage
          src={recipe.thumbnailUrl}
          alt={recipe.title || ""}
          fallbackIcon={recipe.category?.icon}
          width={72}
          height={72}
          style={{ borderRadius: "8px" }}
        />
      </div>
      <div style={styles.recipeCardInfo}>
        <div style={styles.recipeCardCategory}>
          {recipe.category?.icon} {recipe.category?.name}
        </div>
        <h3 style={styles.recipeCardTitle}>{recipe.title || "無題"}</h3>
        <div style={styles.recipeCardCost}>
          自炊 ¥{recipe.estimatedCost ?? "---"}
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "#fef9f0",
    paddingBottom: "80px",
  },
  main: {
    padding: "20px",
    maxWidth: "500px",
    margin: "0 auto",
  },
  loading: {
    textAlign: "center",
    color: "#8b7355",
    padding: "40px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#3d3428",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "14px",
    color: "#8b7355",
    marginBottom: "24px",
  },
  primaryButton: {
    padding: "16px 24px",
    background: "#e07b4c",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  toolbarButton: {
    padding: "8px 16px",
    background: "#fff",
    border: "1px solid #e0d8cf",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#5c4a3a",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  deleteButton: {
    padding: "8px 16px",
    background: "#e07b4c",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#5c4a3a",
    marginBottom: "12px",
  },
  recipeList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  recipeCard: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    borderRadius: "12px",
    padding: "12px",
    boxShadow: "0 2px 8px rgba(92, 74, 58, 0.06)",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  recipeCardSelected: {
    background: "#fff5f0",
    border: "2px solid #e07b4c",
  },
  checkbox: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    border: "2px solid #e0d8cf",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "12px",
    fontSize: "14px",
    color: "#e07b4c",
    fontWeight: 700,
  },
  recipeCardThumbnail: {
    width: "72px",
    height: "72px",
    borderRadius: "8px",
    overflow: "hidden",
    background: "#faf8f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  thumbnailImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImage: {
    fontSize: "32px",
  },
  recipeCardInfo: {
    marginLeft: "12px",
    flex: 1,
    minWidth: 0,
  },
  recipeCardCategory: {
    fontSize: "12px",
    color: "#8b7355",
    marginBottom: "4px",
  },
  recipeCardTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#3d3428",
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  recipeCardCost: {
    fontSize: "13px",
    color: "#8b7355",
  },
  dialogOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 300,
  },
  dialog: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    width: "90%",
    maxWidth: "320px",
  },
  dialogTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#3d3428",
    marginBottom: "12px",
    textAlign: "center",
  },
  dialogText: {
    fontSize: "14px",
    color: "#8b7355",
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: "24px",
  },
  dialogActions: {
    display: "flex",
    gap: "12px",
  },
  dialogCancelButton: {
    flex: 1,
    padding: "12px",
    background: "#fff",
    border: "2px solid #e0d8cf",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#5c4a3a",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  dialogDeleteButton: {
    flex: 1,
    padding: "12px",
    background: "#e07b4c",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
