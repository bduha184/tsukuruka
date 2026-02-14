"use client";
import RecipeImage from "@/components/RecipeImage";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import {
  RECIPE_QUERY,
  UPDATE_RECIPE_STATUS_MUTATION,
  RECIPES_QUERY,
} from "@/lib/graphql";
import { Recipe } from "@/types/graphql";

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data, loading } = useQuery<{ recipe: Recipe }>(RECIPE_QUERY, {
    variables: { id },
  });

  const [updateStatus] = useMutation(UPDATE_RECIPE_STATUS_MUTATION, {
    refetchQueries: [
      { query: RECIPES_QUERY },
      { query: RECIPE_QUERY, variables: { id } },
    ],
  });

  const recipe = data?.recipe;

  const handleOpenVideo = () => {
    if (recipe?.url) {
      window.open(recipe.url, "_blank");
    }
  };

  const handleRestoreToSaved = async () => {
    if (!recipe) return;
    try {
      await updateStatus({
        variables: { id: recipe.id, status: "SAVED" },
      });
    } catch (error) {
      console.error("Error updating recipe status:", error);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Header title="料理詳細" showBack onBack={() => router.back()} />
        <main style={styles.main}>
          <p style={styles.loading}>読み込み中...</p>
        </main>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={styles.container}>
        <Header title="料理詳細" showBack onBack={() => router.back()} />
        <main style={styles.main}>
          <p style={styles.loading}>料理が見つかりません</p>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header title="料理詳細" showBack onBack={() => router.back()} />
      <main style={styles.main}>
        {/* サムネイル */}
        <div style={styles.thumbnailContainer}>
          <RecipeImage
            src={recipe.thumbnailUrl}
            alt={recipe.title || "料理"}
            fallbackIcon={recipe.category?.icon}
            height={250}
          />
        </div>

        {/* 情報 */}
        <div style={styles.info}>
          <div style={styles.categoryBadge}>
            {recipe.category?.icon} {recipe.category?.name}
          </div>
          <h1 style={styles.title}>{recipe.title || "無題"}</h1>

          {/* コスト比較 */}
          <div style={styles.costComparison}>
            <div style={styles.costItem}>
              <span style={styles.costLabel}>自炊</span>
              <span style={styles.costValue}>
                ¥{recipe.estimatedCost ?? "---"}
              </span>
            </div>
            <span style={styles.costVs}>vs</span>
            <div style={styles.costItem}>
              <span style={styles.costLabel}>外食</span>
              <span style={styles.costValue}>
                ¥{recipe.eatingOutCost ?? "---"}
              </span>
            </div>
          </div>

          {/* ステータス */}
          <div style={styles.statusBadge}>
            {recipe.status === "SAVED" && "📌 これから作る"}
            {recipe.status === "COOKED" && "✅ 作った"}
            {recipe.status === "DELETED" && "🗑️ 削除済み"}
          </div>

          {/* プラットフォーム */}
          {recipe.platform && (
            <p style={styles.platform}>📺 {recipe.platform}</p>
          )}
        </div>

        {/* アクション */}
        <div style={styles.actions}>
          <button onClick={handleOpenVideo} style={styles.primaryButton}>
            ▶ 動画を見る
          </button>
          {recipe.status === "COOKED" && (
            <button
              onClick={handleRestoreToSaved}
              style={styles.secondaryButton}
            >
              🔄 また作りたい
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "#fef9f0",
  },
  main: {
    maxWidth: "500px",
    margin: "0 auto",
  },
  loading: {
    textAlign: "center",
    color: "#8b7355",
    padding: "40px",
  },
  thumbnailContainer: {
    width: "100%",
    height: "250px",
    background: "#f0ebe3",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noThumbnail: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#faf8f5",
  },
  noThumbnailIcon: {
    fontSize: "64px",
  },
  info: {
    padding: "24px 20px",
  },
  categoryBadge: {
    display: "inline-block",
    padding: "6px 12px",
    background: "#fff",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#5c4a3a",
    marginBottom: "12px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#3d3428",
    marginBottom: "20px",
  },
  costComparison: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "20px",
    background: "#fff",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  costItem: {
    textAlign: "center",
  },
  costLabel: {
    display: "block",
    fontSize: "12px",
    color: "#8b7355",
    marginBottom: "4px",
  },
  costValue: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#3d3428",
  },
  costVs: {
    color: "#8b7355",
    fontSize: "14px",
  },
  statusBadge: {
    padding: "10px 16px",
    background: "#fff",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#5c4a3a",
    textAlign: "center",
    marginBottom: "12px",
  },
  platform: {
    fontSize: "14px",
    color: "#8b7355",
    textAlign: "center",
  },
  actions: {
    padding: "0 20px 40px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
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
  secondaryButton: {
    padding: "16px 24px",
    background: "#fff",
    color: "#5c4a3a",
    border: "2px solid #e0d8cf",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
