'use client'

import { useQuery, useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import RecipeImage from '@/components/RecipeImage'
import {
  RECIPES_QUERY,
  UPDATE_RECIPE_STATUS_MUTATION
} from '@/lib/graphql'
import { Recipe } from '@/types/graphql'

export default function DeletedPage() {
  const router = useRouter()

  const { data, loading } = useQuery<{ recipes: Recipe[] }>(RECIPES_QUERY, {
    variables: { status: 'DELETED' },
  })

  const [updateStatus] = useMutation(UPDATE_RECIPE_STATUS_MUTATION, {
    refetchQueries: [{ query: RECIPES_QUERY }],
  })

  const deletedRecipes = data?.recipes || []

  const handleRestore = async (id: string) => {
    try {
      await updateStatus({
        variables: { id, status: 'SAVED' },
      })
    } catch (error) {
      console.error('Error restoring recipe:', error)
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <Header title="削除した料理" showBack onBack={() => router.back()} />
        <main style={styles.main}>
          <p style={styles.loading}>読み込み中...</p>
        </main>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <Header title="削除した料理" showBack onBack={() => router.back()} />
      <main style={styles.main}>
        {deletedRecipes.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🗑️</span>
            <h2 style={styles.emptyTitle}>削除した料理はありません</h2>
            <p style={styles.emptyText}>
              削除した料理はここに表示されます
            </p>
          </div>
        ) : (
          <div style={styles.recipeList}>
            {deletedRecipes.map(recipe => (
              <div key={recipe.id} style={styles.recipeCard}>
                <div style={styles.recipeCardThumbnail}>
                  <RecipeImage
                    src={recipe.thumbnailUrl}
                    alt={recipe.title || ''}
                    fallbackIcon={recipe.category?.icon}
                    width={72}
                    height={72}
                  />
                </div>
                <div style={styles.recipeCardInfo}>
                  <div style={styles.recipeCardCategory}>
                    {recipe.category?.icon} {recipe.category?.name}
                  </div>
                  <h3 style={styles.recipeCardTitle}>{recipe.title || '無題'}</h3>
                </div>
                <button
                  onClick={() => handleRestore(recipe.id)}
                  style={styles.restoreButton}
                >
                  復元
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#fef9f0',
  },
  main: {
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    color: '#8b7355',
    padding: '40px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#3d3428',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#8b7355',
  },
  recipeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recipeCard: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 2px 8px rgba(92, 74, 58, 0.06)',
  },
  recipeCardThumbnail: {
    width: '72px',
    height: '72px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#faf8f5',
    flexShrink: 0,
  },
  recipeCardInfo: {
    marginLeft: '12px',
    flex: 1,
    minWidth: 0,
  },
  recipeCardCategory: {
    fontSize: '12px',
    color: '#8b7355',
    marginBottom: '4px',
  },
  recipeCardTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#3d3428',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  restoreButton: {
    padding: '8px 16px',
    background: '#e07b4c',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
}
