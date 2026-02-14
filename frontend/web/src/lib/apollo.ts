import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client'
import { supabase } from './supabase'

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/query`
    : 'http://localhost:8080/query',
})

// 認証ヘッダーを追加するミドルウェア
const authLink = new ApolloLink((operation, forward) => {
  // 同期的にlocalStorageからトークンを取得
  let token = ''

  if (typeof window !== 'undefined') {
    const storageKey = `sb-bnrmblkljryoeaxjrbfi-auth-token`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        token = parsed.access_token || ''
      } catch (e) {
        console.error('Failed to parse auth token:', e)
      }
    }
  }

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }))

  return forward(operation)
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})

// キャッシュをクリアする関数（ログイン/ログアウト時に使用）
export const clearApolloCache = () => {
  apolloClient.clearStore()
}
