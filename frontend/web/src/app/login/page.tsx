'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function LoginPage() {
  const router = useRouter()

  const handleGoogleLogin = () => {
    // TODO: Google OAuth実装
    alert('Google ログインは後で実装します')
  }

  const handleAppleLogin = () => {
    // TODO: Apple OAuth実装
    alert('Apple ログインは後で実装します')
  }

  const handleLineLogin = () => {
    // TODO: LINE OAuth実装
    alert('LINE ログインは後で実装します')
  }

  return (
    <div style={styles.container}>
      <Header title="ログイン" showBack onBack={() => router.back()} />
      <main style={styles.main}>
        <div style={styles.content}>
          <span style={styles.icon}>🔐</span>
          <h2 style={styles.title}>ログイン</h2>
          <p style={styles.description}>
            ログインすると、データがクラウドに<br />
            保存され、機種変更しても引き継げます
          </p>

          <div style={styles.buttons}>
            <button onClick={handleGoogleLogin} style={styles.googleButton}>
              <span style={styles.buttonIcon}>G</span>
              Googleでログイン
            </button>
            <button onClick={handleAppleLogin} style={styles.appleButton}>
              <span style={styles.buttonIcon}>🍎</span>
              Appleでログイン
            </button>
            <button onClick={handleLineLogin} style={styles.lineButton}>
              <span style={styles.buttonIcon}>L</span>
              LINEでログイン
            </button>
          </div>

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
  content: {
    textAlign: 'center',
    padding: '40px 0',
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
    marginBottom: '40px',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px',
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
  appleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 24px',
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  lineButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 24px',
    background: '#06C755',
    color: '#fff',
    border: 'none',
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
  terms: {
    fontSize: '12px',
    color: '#8b7355',
    lineHeight: 1.6,
  },
  link: {
    color: '#e07b4c',
    textDecoration: 'underline',
  },
}
