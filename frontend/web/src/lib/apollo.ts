import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from '@apollo/client'
import { supabase } from './supabase'

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/query`
    : 'http://localhost:8080/query',
})

// 認証ヘッダーを追加するミドルウェア（非同期対応）
const authLink = new ApolloLink((operation, forward) => {
  return new Observable(observer => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const token = session?.access_token || ''

      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      }))

      forward(operation).subscribe({
        next: observer.next.bind(observer),
        error: observer.error.bind(observer),
        complete: observer.complete.bind(observer),
      })
    }).catch(error => {
      console.error('Failed to get session:', error)
      forward(operation).subscribe({
        next: observer.next.bind(observer),
        error: observer.error.bind(observer),
        complete: observer.complete.bind(observer),
      })
    })
  })
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
