'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import RecipeImage from '@/components/RecipeImage'
import {
  TODAY_RECIPE_QUERY,
  UPDATE_RECIPE_STATUS_MUTATION,
  SKIP_RECIPE_TODAY_MUTATION
} from '@/lib/graphql'
import { Recipe } from '@/types/graphql'

type HomeState = 'SUGGESTION' | 'COOKED' | 'EMPTY'

export default function Home() {
  const router = useRouter()
  const [homeState, setHomeState] = useState<HomeState>('SUGGESTION')
  const [cookedRecipe, setCookedRecipe] = useState<Recipe | null>(null)

  const { data, loading, refetch } = useQuery<{ todayRecipe: Recipe | null }>(
    TODAY_RECIPE_QUERY
  )

  const [updateStatus] = useMutation(UPDATE_RECIPE_STATUS_MUTATION)
  const [skipRecipe] = useMutation(SKIP_RECIPE_TODAY_MUTATION)

  const recipe = data?.todayRecipe

  // レシピがない場合はEMPTY状態に
  const currentState = !recipe && !loading ? 'EMPTY' : homeState

  const handleCook = async () => {
    if (!recipe) return
    try {
      await updateStatus({
        variables: { id: recipe.id, status: 'COOKED' },
      })
      setCookedRecipe(recipe)
      setHomeState('COOKED')
    } catch (error) {
      console.error('Error updating recipe status:', error)
    }
  }

  const handleSkip = async () => {
    if (!recipe) return
    try {
      await skipRecipe({
        variables: { id: recipe.id },
      })
      // 次の料理を取得
      const result = await refetch()
      if (!result.data?.todayRecipe) {
        setHomeState('EMPTY')
      }
    } catch (error) {
      console.error('Error skipping recipe:', error)
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main}>
          <p style={styles.loading}>読み込み中...</p>
        </main>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        {currentState === 'EMPTY' && (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🍽️</span>
            <h2 style={styles.emptyTitle}>今日の料理は終了！</h2>
            <p style={styles.emptyText}>
              また明日チェックしましょう！{'\n'}
              新しい料理を追加することもできます。
            </p>
            <button
              onClick={() => router.push('/register')}
              style={styles.primaryButton}
            >
              料理を登録する
            </button>
          </div>
        )}

        {currentState === 'SUGGESTION' && recipe && (
          <div style={styles.suggestion}>
            <p style={styles.suggestionLabel}>今日の提案</p>
            <div style={styles.recipeCard}>
              <RecipeImage
                src={recipe.thumbnailUrl}
                alt={recipe.title || '料理'}
                fallbackIcon={recipe.category?.icon}
                height={200}
              />
              <div style={styles.recipeInfo}>
                <div style={styles.categoryBadge}>
                  {recipe.category?.icon} {recipe.category?.name}
                </div>
                <h2 style={styles.recipeTitle}>{recipe.title || '無題'}</h2>
                <div style={styles.costComparison}>
                  <div style={styles.costItem}>
                    <span style={styles.costLabel}>自炊</span>
                    <span style={styles.costValue}>
                      ¥{recipe.estimatedCost ?? '---'}
                    </span>
                  </div>
                  <span style={styles.costVs}>vs</span>
                  <div style={styles.costItem}>
                    <span style={styles.costLabel}>外食</span>
                    <span style={styles.costValue}>
                      ¥{recipe.eatingOutCost ?? '---'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.actions}>
              <button onClick={handleCook} style={styles.primaryButton}>
                🍳 作る！
              </button>
              <button onClick={handleSkip} style={styles.secondaryButton}>
                今日はパス
              </button>
            </div>
          </div>
        )}

        {currentState === 'COOKED' && cookedRecipe && (
          <div style={styles.resultState}>
            <span style={styles.resultIcon}>🎉</span>
            <h2 style={styles.resultTitle}>今日も料理おつかれさま！</h2>
            {cookedRecipe.eatingOutCost && cookedRecipe.estimatedCost && (
              <p style={styles.savingText}>
                約 ¥{cookedRecipe.eatingOutCost - cookedRecipe.estimatedCost} 節約しました
              </p>
            )}
            <button
              onClick={() => router.push('/recipes')}
              style={styles.secondaryButton}
            >
              料理一覧を見る
            </button>
          </div>
        )}
      </main>
      <Footer isEmpty={currentState === 'EMPTY'} />
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#fef9f0',
    paddingBottom: '80px',
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
    lineHeight: 1.6,
    marginBottom: '24px',
    whiteSpace: 'pre-line',
  },
  suggestion: {
    padding: '20px 0',
  },
  suggestionLabel: {
    fontSize: '14px',
    color: '#8b7355',
    marginBottom: '16px',
    textAlign: 'center',
  },
  recipeCard: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(92, 74, 58, 0.08)',
  },
  recipeInfo: {
    padding: '20px',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    background: '#faf8f5',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#5c4a3a',
    marginBottom: '12px',
  },
  recipeTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#3d3428',
    marginBottom: '16px',
  },
  costComparison: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '16px',
    background: '#faf8f5',
    borderRadius: '12px',
  },
  costItem: {
    textAlign: 'center',
  },
  costLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#8b7355',
    marginBottom: '4px',
  },
  costValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#3d3428',
  },
  costVs: {
    color: '#8b7355',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px',
  },
  primaryButton: {
    padding: '16px 24px',
    background: '#e07b4c',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  secondaryButton: {
    padding: '16px 24px',
    background: '#fff',
    color: '#5c4a3a',
    border: '2px solid #e0d8cf',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  resultState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  resultIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '20px',
  },
  resultTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#3d3428',
    marginBottom: '12px',
  },
  savingText: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e07b4c',
    marginBottom: '24px',
  },
}
