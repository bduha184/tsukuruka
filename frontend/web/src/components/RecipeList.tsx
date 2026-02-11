"use client";
import { RECIPES_QUERY } from "@/lib/graphql/queries";
import { useQuery } from "@apollo/client/react";
import { RecipesQueryData } from "@/types/graphql";

export function RecipeList() {
  const { loading, error, data } = useQuery<RecipesQueryData>(RECIPES_QUERY);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>✏️ つくりおき</h1>
      <p style={styles.subtitle}>疎通確認ページ</p>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📡 Backend → Frontend 疎通確認</h2>

        {loading && <p>読み込み中...</p>}

        {error && (
          <div style={styles.error}>
            <p>❌ エラー: {error.message}</p>
            <p style={styles.hint}>
              バックエンドが起動しているか確認してください
            </p>
          </div>
        )}

        {!loading && !error && (
          <div style={styles.success}>
            <p>✅ 接続成功！</p>
            <p style={styles.hint}>GraphQLからデータを取得できました</p>
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📋 取得したレシピ</h2>
        {Array.isArray(data?.recipes) && data.recipes.length > 0 ? (
          <ul style={styles.list}>
            {data.recipes.map((recipe) => (
              <li key={recipe.id} style={styles.listItem}>
                <span style={styles.recipeText}>{recipe.title}</span>
                <span style={styles.recipeUser}>by {recipe.category.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={styles.empty}>レシピがありません</p>
        )}
      </div>

      <div style={styles.links}>
        <a
          href={`${API_URL}/`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          📊 GraphQL Playground
        </a>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #fef9f0 0%, #f5efe6 100%)",
    padding: "40px 20px",
    textAlign: "center",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#5c4a3a",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#8b7355",
    marginTop: "8px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    margin: "24px auto",
    maxWidth: "500px",
    boxShadow: "0 2px 12px rgba(92, 74, 58, 0.08)",
    textAlign: "left",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#3d3428",
    margin: "0 0 16px 0",
  },
  error: {
    background: "#fff5f5",
    padding: "12px",
    borderRadius: "8px",
    color: "#c53030",
  },
  success: {
    background: "#e8f5e8",
    padding: "12px",
    borderRadius: "8px",
    color: "#2f855a",
  },
  hint: {
    fontSize: "12px",
    margin: "8px 0 0 0",
    opacity: 0.8,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    background: "#faf8f5",
    borderRadius: "8px",
    marginBottom: "8px",
  },
  recipeText: {
    fontWeight: "600",
    color: "#3d3428",
  },
  recipeUser: {
    fontSize: "12px",
    color: "#8b7355",
  },
  empty: {
    color: "#8b7355",
    textAlign: "center",
  },
  links: {
    marginTop: "32px",
  },
  link: {
    display: "inline-block",
    padding: "12px 24px",
    background: "#e07b4c",
    color: "#fff",
    borderRadius: "24px",
    textDecoration: "none",
    fontWeight: "600",
  },
};
