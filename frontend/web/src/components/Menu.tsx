'use client'

import { useRouter } from 'next/navigation'

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Menu({ isOpen, onClose }: MenuProps) {
  const router = useRouter()

  const navigate = (path: string) => {
    onClose()
    router.push(path)
  }

  if (!isOpen) return null

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.menu}>
        <button onClick={onClose} style={styles.closeButton}>
          <div style={styles.closeIcon}>
            <span style={{ ...styles.closeLine, transform: 'rotate(45deg)' }} />
            <span style={{ ...styles.closeLine, transform: 'rotate(-45deg)' }} />
          </div>
        </button>
        <nav style={styles.nav}>
          <button onClick={() => navigate('/')} style={styles.navItem}>
            🏠 ホーム
          </button>
          <button onClick={() => navigate('/recipes')} style={styles.navItem}>
            📋 料理一覧
          </button>
          <button onClick={() => navigate('/register')} style={styles.navItem}>
            ➕ 料理を登録
          </button>
          <button onClick={() => navigate('/deleted')} style={styles.navItem}>
            🗑️ 削除した料理
          </button>
          <div style={styles.divider} />
          <button onClick={() => navigate('/login')} style={styles.navItem}>
            🔐 ログイン
          </button>
          <button onClick={() => navigate('/about')} style={styles.navItem}>
            ℹ️ このアプリについて
          </button>
        </nav>
      </div>
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 200,
  },
  menu: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '280px',
    height: '100vh',
    background: '#fff',
    zIndex: 201,
    padding: '20px',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    width: '40px',
    height: '40px',
  },
  closeIcon: {
    position: 'relative',
    width: '24px',
    height: '24px',
  },
  closeLine: {
    position: 'absolute',
    top: '11px',
    left: 0,
    width: '24px',
    height: '2px',
    background: '#5c4a3a',
    borderRadius: '1px',
  },
  nav: {
    marginTop: '60px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'none',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#3d3428',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s',
  },
  divider: {
    height: '1px',
    background: '#f0ebe3',
    margin: '8px 0',
  },
}
