'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import RecipeImage from '@/components/RecipeImage'
import {
  CREATE_RECIPE_MUTATION,
  CATEGORIES_QUERY,
  RECIPES_QUERY
} from '@/lib/graphql'
import { Category } from '@/lib/types'
import { fetchOGP, OGPData } from '@/lib/ogp'

export default function RegisterPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [platform, setPlatform] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingOGP, setIsFetchingOGP] = useState(false)
  const [ogpFetched, setOgpFetched] = useState(false)

  const { data: categoriesData } = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY)
  const categories = categoriesData?.categories || []

  const [createRecipe] = useMutation(CREATE_RECIPE_MUTATION, {
    refetchQueries: [{ query: RECIPES_QUERY }],
  })

  // URL変更時にOGPを自動取得
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (url && isValidUrl(url) && !ogpFetched) {
        await handleFetchOGP()
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [url])

  const isValidUrl = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  const handleFetchOGP = async () => {
    if (!url || !isValidUrl(url)) return

    setIsFetchingOGP(true)
    try {
      const ogp = await fetchOGP(url)
      if (ogp) {
        if (ogp.title && !title) setTitle(ogp.title)
        if (ogp.image && !thumbnailUrl) setThumbnailUrl(ogp.image)
        if (ogp.platform && !platform) setPlatform(ogp.platform)
        setOgpFetched(true)
      }
    } catch (error) {
      console.error('OGP fetch error:', error)
    } finally {
      setIsFetchingOGP(false)
    }
  }

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    // URL変更時はOGP取得フラグをリセット
    if (newUrl !== url) {
      setOgpFetched(false)
    }
  }

  const handleSubmit = async () => {
    if (!url) return

    setIsSubmitting(true)
    try {
      await createRecipe({
        variables: {
          input: {
            url,
            title: title || null,
            thumbnailUrl: thumbnailUrl || null,
            platform: platform || null,
            categoryId: categoryId || null,
            estimatedCost: estimatedCost ? parseInt(estimatedCost) : null,
          },
        },
      })
      router.push('/recipes')
    } catch (error) {
      console.error('Error creating recipe:', error)
      alert('登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={styles.container}>
      <Header
        title="料理を登録"
        showBack
        onBack={() => router.back()}
      />
      <main style={styles.main}>
        <div style={styles.content}>
          <span style={styles.icon}>🍽️</span>
          <h2 style={styles.title}>料理を登録</h2>
          <p style={styles.description}>
            作りたい料理の動画URLを<br />
            登録しましょう
          </p>

          <div style={styles.form}>
            {/* URL入力 */}
            <div style={styles.field}>
              <label style={styles.label}>URL *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                style={styles.input}
              />
              {isFetchingOGP && (
                <p style={styles.fetchingText}>📡 情報を取得中...</p>
              )}
            </div>

            {/* プレビュー */}
            {(thumbnailUrl || title) && (
              <div style={styles.preview}>
                <p style={styles.previewLabel}>プレビュー</p>
                <div style={styles.previewCard}>
                  <RecipeImage
                    src={thumbnailUrl}
                    alt={title || ''}
                    height={160}
                  />
                  <div style={styles.previewInfo}>
                    {platform && (
                      <span style={styles.previewPlatform}>{platform}</span>
                    )}
                    <p style={styles.previewTitle}>{title || '無題'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* タイトル入力 */}
            <div style={styles.field}>
              <label style={styles.label}>タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="料理名を入力"
                style={styles.input}
              />
            </div>

            {/* サムネイルURL */}
            <div style={styles.field}>
              <label style={styles.label}>サムネイルURL</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                style={styles.input}
              />
            </div>

            {/* プラットフォーム */}
            <div style={styles.field}>
              <label style={styles.label}>プラットフォーム</label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="YouTube, TikTok, etc."
                style={styles.input}
              />
            </div>

            {/* カテゴリ選択 */}
            <div style={styles.field}>
              <label style={styles.label}>カテゴリ</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={styles.select}
              >
                <option value="">選択してください</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}（外食: ¥{cat.eatingOutCost}）
                  </option>
                ))}
              </select>
            </div>

            {/* 自炊コスト入力 */}
            <div style={styles.field}>
              <label style={styles.label}>自炊コスト（目安）</label>
              <div style={styles.costInput}>
                <span style={styles.costPrefix}>¥</span>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="300"
                  style={styles.costField}
                />
              </div>
            </div>

            {/* 登録ボタン */}
            <button
              onClick={handleSubmit}
              disabled={!url || isSubmitting}
              style={{
                ...styles.submitButton,
                ...(!url || isSubmitting ? styles.submitButtonDisabled : {}),
              }}
            >
              {isSubmitting ? '登録中...' : '登録する'}
            </button>
          </div>
        </div>
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
    paddingBottom: '40px',
  },
  content: {
    textAlign: 'center',
    padding: '20px 0',
  },
  icon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#3d3428',
    marginBottom: '8px',
  },
  description: {
    fontSize: '14px',
    color: '#8b7355',
    lineHeight: 1.6,
    marginBottom: '32px',
  },
  form: {
    textAlign: 'left',
  },
  field: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#5c4a3a',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e0d8cf',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e0d8cf',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  costInput: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #e0d8cf',
    borderRadius: '12px',
    background: '#fff',
    overflow: 'hidden',
  },
  costPrefix: {
    padding: '14px 12px',
    background: '#faf8f5',
    color: '#8b7355',
    fontWeight: 600,
  },
  costField: {
    flex: 1,
    padding: '14px 16px',
    border: 'none',
    fontSize: '16px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  fetchingText: {
    fontSize: '13px',
    color: '#e07b4c',
    marginTop: '8px',
  },
  preview: {
    marginBottom: '24px',
  },
  previewLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#5c4a3a',
    marginBottom: '8px',
  },
  previewCard: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(92, 74, 58, 0.08)',
  },
  previewInfo: {
    padding: '12px 16px',
  },
  previewPlatform: {
    display: 'inline-block',
    padding: '4px 8px',
    background: '#faf8f5',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#8b7355',
    marginBottom: '8px',
  },
  previewTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#3d3428',
    margin: 0,
  },
  submitButton: {
    width: '100%',
    padding: '16px 24px',
    background: '#e07b4c',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: '12px',
  },
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}
