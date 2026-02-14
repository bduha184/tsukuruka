'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) {
        console.error('Auth callback error:', error)
      }
      router.push('/')
    }

    handleCallback()
  }, [router])

  return (
    <div style={styles.container}>
      <p style={styles.text}>ログイン処理中...</p>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fef9f0',
  },
  text: {
    fontSize: '16px',
    color: '#8b7355',
  },
}
