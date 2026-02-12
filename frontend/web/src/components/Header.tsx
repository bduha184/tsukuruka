'use client'

import { useState } from 'react'
import Menu from './Menu'

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function Header({ title = 'つくりおき', showBack, onBack }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header style={styles.header}>
        {showBack ? (
          <button onClick={onBack} style={styles.backButton}>
            ← 戻る
          </button>
        ) : (
          <div style={styles.placeholder} />
        )}
        <h1 style={styles.title}>✏️ {title}</h1>
        <button
          onClick={() => setMenuOpen(true)}
          style={styles.menuButton}
          aria-label="メニューを開く"
        >
          <div style={styles.menuIcon}>
            <span style={styles.menuLine} />
            <span style={styles.menuLine} />
            <span style={styles.menuLine} />
          </div>
        </button>
      </header>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#fef9f0',
    borderBottom: '1px solid #f0ebe3',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#5c4a3a',
  },
  backButton: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    color: '#8b7355',
    cursor: 'pointer',
    padding: '8px',
  },
  placeholder: {
    width: '60px',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    width: '40px',
    height: '40px',
  },
  menuIcon: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  menuLine: {
    display: 'block',
    width: '24px',
    height: '2px',
    background: '#5c4a3a',
    borderRadius: '1px',
  },
}
