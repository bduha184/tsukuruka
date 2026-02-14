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
    const data: OGPData = await response.json()

    // プロキシURLの場合、フルURLに変換
    if (data.image && data.image.startsWith('/api/image-proxy')) {
      data.image = `${API_URL}${data.image}`
    }

    return data
  } catch (error) {
    console.error('OGP fetch error:', error)
    return null
  }
}
