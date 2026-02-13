const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface OGPData {
  title: string
  description: string
  image: string
  siteName: string
  url: string
  platform: string
}

export async function fetchOGP(url: string): Promise<OGPData | null> {
  try {
    const response = await fetch(
      `${API_URL}/api/ogp?url=${encodeURIComponent(url)}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch OGP')
    }
    return await response.json()
  } catch (error) {
    console.error('OGP fetch error:', error)
    return null
  }
}
