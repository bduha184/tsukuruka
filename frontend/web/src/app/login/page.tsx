'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const { error } = isSignUp
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password)

      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    await signInWithGoogle()
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <Header title="ログイン" showBack onBack={() => router.back()} />
        <main style={styles.main}>
          <p style={styles.loading}>読み込み中...</p>
        </main>
      </div>
    )
  }

  // ログイン済みの場合
  if (user) {
    return (
      <div style={styles.container}>
        <Header title="アカウント" showBack onBack={() => router.back()} />
        <main style={styles.main}>
          <div style={styles.content}>
            <span style={styles.icon}>👤</span>
            <h2 style={styles.title}>ログイン中</h2>
            <p style={styles.userEmail}>{user.email}</p>

            <div style={styles.buttons}>
              <button onClick={handleLogout} style={styles.logoutButton}>
                ログアウト
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <Header title="ログイン" showBack onBack={() => router.back()} />
      <main style={styles.main}>
        <div style={styles.content}>
          <span style={styles.icon}>🔐</span>
          <h2 style={styles.title}>{isSignUp ? '新規登録' : 'ログイン'}</h2>
          <p style={styles.description}>
            ログインすると、データがクラウドに<br />
            保存され、機種変更しても引き継げます
          </p>

          {/* ソーシャルログイン */}
          <div style={styles.socialButtons}>
            <button onClick={handleGoogleLogin} style={styles.googleButton}>
              <span style={styles.buttonIcon}>G</span>
              Googleでログイン
            </button>
          </div>

          <div style={styles.divider}>
            <span style={styles.dividerText}>または</span>
          </div>

          {/* メールログイン */}
          <form onSubmit={handleEmailAuth} style={styles.form}>
            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.field}>
              <label style={styles.label}>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                style={styles.input}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                ...(isSubmitting ? styles.submitButtonDisabled : {}),
              }}
            >
              {isSubmitting ? '処理中...' : isSignUp ? '新規登録' : 'ログイン'}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={styles.toggleButton}
          >
            {isSignUp ? 'すでにアカウントをお持ちの方' : '新規登録はこちら'}
          </button>

          <p style={styles.terms}>
            ログインすることで、
            <a href="/about/terms" style={styles.link}>利用規約</a>
            および
            <a href="/about/privacy" style={styles.link}>プライバシーポリシー</a>
            に同意したものとみなされます。
          </p>
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
  },
  loading: {
    textAlign: 'center',
    color: '#8b7355',
    padding: '40px',
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
    fontSize: '24px',
    fontWeight: 700,
    color: '#3d3428',
    marginBottom: '12px',
  },
  description: {
    fontSize: '14px',
    color: '#8b7355',
    lineHeight: 1.6,
    marginBottom: '32px',
  },
  userEmail: {
    fontSize: '16px',
    color: '#5c4a3a',
    marginBottom: '32px',
  },
  socialButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 24px',
    background: '#fff',
    color: '#3d3428',
    border: '2px solid #e0d8cf',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  buttonIcon: {
    fontSize: '18px',
    fontWeight: 700,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
  },
  dividerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: '13px',
    color: '#8b7355',
    background: '#fef9f0',
    position: 'relative',
  },
  form: {
    textAlign: 'left',
  },
  field: {
    marginBottom: '16px',
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
  error: {
    color: '#e07b4c',
    fontSize: '14px',
    marginBottom: '16px',
    padding: '12px',
    background: '#fff5f0',
    borderRadius: '8px',
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
  },
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  toggleButton: {
    marginTop: '16px',
    padding: '12px',
    background: 'none',
    border: 'none',
    color: '#e07b4c',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'underline',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  logoutButton: {
    padding: '16px 24px',
    background: '#fff',
    color: '#e07b4c',
    border: '2px solid #e07b4c',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  terms: {
    marginTop: '24px',
    fontSize: '12px',
    color: '#8b7355',
    lineHeight: 1.6,
  },
  link: {
    color: '#e07b4c',
    textDecoration: 'underline',
  },
}
