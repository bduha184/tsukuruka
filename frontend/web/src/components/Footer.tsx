'use client'

import { useRouter, usePathname } from 'next/navigation'

interface FooterProps {
  isEmpty?: boolean;
}

export default function Footer({ isEmpty = false }: FooterProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <footer style={styles.footer}>
      <button
        onClick={() => router.push('/recipes')}
        style={{
          ...styles.footerButton,
          ...(pathname === '/recipes' ? styles.footerButtonActive : {}),
        }}
      >
        📋 料理一覧
      </button>
      <button
        onClick={() => !isEmpty && router.push('/register')}
        style={{
          ...styles.footerButton,
          ...(pathname === '/register' ? styles.footerButtonActive : {}),
          ...(isEmpty ? styles.footerButtonDisabled : {}),
        }}
        disabled={isEmpty}
      >
        ➕ 料理を登録
      </button>
    </footer>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    background: '#fff',
    borderTop: '1px solid #f0ebe3',
    padding: '12px 20px',
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
    zIndex: 100,
  },
  footerButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '12px',
    background: '#faf8f5',
    fontSize: '14px',
    fontWeight: 600,
    color: '#5c4a3a',
    cursor: 'pointer',
    margin: '0 4px',
    transition: 'all 0.2s',
  },
  footerButtonActive: {
    background: '#e07b4c',
    color: '#fff',
  },
  footerButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
}
