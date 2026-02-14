'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div style={styles.container}>
      <Header title="利用規約" showBack onBack={() => router.back()} />
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>利用規約</h1>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>第1条（適用）</h2>
            <p style={styles.text}>
              本規約は、本サービス「つくりおき」の利用条件を定めるものです。
              ユーザーは本規約に同意の上、本サービスを利用するものとします。
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>第2条（利用登録）</h2>
            <p style={styles.text}>
              本サービスは、アカウント登録なしでも基本機能を利用できます。
              ソーシャルログインを行うことで、データのバックアップが可能になります。
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>第3条（禁止事項）</h2>
            <p style={styles.text}>
              ユーザーは、以下の行為をしてはなりません。
            </p>
            <ul style={styles.list}>
              <li>法令または公序良俗に違反する行為</li>
              <li>サービスの運営を妨害する行為</li>
              <li>他のユーザーに迷惑をかける行為</li>
              <li>不正アクセスを試みる行為</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>第4条（免責事項）</h2>
            <p style={styles.text}>
              本サービスは「現状有姿」で提供されます。
              サービスの中断、データの消失等について、運営者は責任を負いません。
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>第5条（規約の変更）</h2>
            <p style={styles.text}>
              運営者は、必要に応じて本規約を変更できるものとします。
              変更後の規約は、本サービス上で公開した時点で効力を生じます。
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
