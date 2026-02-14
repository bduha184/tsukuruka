'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div style={styles.container}>
      <Header title="プライバシーポリシー" showBack onBack={() => router.back()} />
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>プライバシーポリシー</h1>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>1. 収集する情報</h2>
            <p style={styles.text}>
              本サービスでは、以下の情報を収集する場合があります。
            </p>
            <ul style={styles.list}>
              <li>ソーシャルログイン時の識別子（メールアドレスは収集しません）</li>
              <li>登録された料理のURL、タイトル、カテゴリ</li>
              <li>アプリの利用状況</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>2. 情報の利用目的</h2>
            <p style={styles.text}>
              収集した情報は、以下の目的で利用します。
            </p>
            <ul style={styles.list}>
              <li>サービスの提供・運営</li>
              <li>サービスの改善・新機能の開発</li>
              <li>ユーザーサポート</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>3. 第三者提供</h2>
            <p style={styles.text}>
              法令に基づく場合を除き、ユーザーの同意なく第三者に情報を提供することはありません。
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>4. データの削除</h2>
            <p style={styles.text}>
              ユーザーはいつでもアカウントを削除でき、
              削除時にはすべてのデータが消去されます。
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>5. お問い合わせ</h2>
            <p style={styles.text}>
              プライバシーに関するお問い合わせは、アプリ内のお問い合わせフォームよりご連絡ください。
            </p>
          </section>

          <p style={styles.date}>制定日：2024年1月1日</p>
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
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#3d3428',
    marginBottom: '24px',
    textAlign: 'center',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#3d3428',
    marginBottom: '12px',
  },
  text: {
    fontSize: '14px',
    color: '#5c4a3a',
    lineHeight: 1.8,
  },
  list: {
    fontSize: '14px',
    color: '#5c4a3a',
    lineHeight: 1.8,
    paddingLeft: '20px',
    marginTop: '8px',
  },
  date: {
    fontSize: '12px',
    color: '#8b7355',
    textAlign: 'right',
  },
}
