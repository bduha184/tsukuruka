'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function AboutPage() {
  const router = useRouter()

  return (
    <div style={styles.container}>
      <Header title="このアプリについて" showBack onBack={() => router.back()} />
      <main style={styles.main}>
        <div style={styles.content}>
          {/* アプリ情報 */}
          <div style={styles.appInfo}>
            <span style={styles.appIcon}>✏️</span>
            <h1 style={styles.appName}>つくりおき</h1>
            <p style={styles.appTagline}>作りたい料理を思い出させるアプリ</p>
          </div>

          {/* 説明 */}
          <div style={styles.section}>
            <p style={styles.description}>
              料理動画を見て「作りたい！」と思ったけど、結局作れていない…
              そんな経験はありませんか？
            </p>
            <p style={styles.description}>
              つくりおきは、あなたが登録した「作りたい料理」を、
              毎日ひとつだけ提案します。
            </p>
            <p style={styles.description}>
              判断は1日1回だけ。「作らない」も正解。
              外食に流れる自分を責めない、そんなアプリです。
            </p>
          </div>

          {/* リンク */}
          <div style={styles.links}>
            <button
              onClick={() => router.push('/about/terms')}
              style={styles.linkButton}
            >
              📄 利用規約
            </button>
            <button
              onClick={() => router.push('/about/privacy')}
              style={styles.linkButton}
            >
              🔒 プライバシーポリシー
            </button>
          </div>

          {/* バージョン */}
          <div style={styles.version}>
            <p>Version 1.0.0</p>
            <p>© 2024 つくりおき</p>
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
  },
  content: {
    padding: '20px 0',
  },
  appInfo: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  appIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '12px',
  },
  appName: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#3d3428',
    marginBottom: '8px',
  },
  appTagline: {
    fontSize: '14px',
    color: '#8b7355',
  },
  section: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  },
  description: {
    fontSize: '14px',
    color: '#5c4a3a',
    lineHeight: 1.8,
    marginBottom: '16px',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '40px',
  },
  linkButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#3d3428',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  version: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#8b7355',
    lineHeight: 1.8,
  },
}
