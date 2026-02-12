'use client'

import Image from 'next/image'

interface RecipeImageProps {
  src: string | null | undefined
  alt: string
  fallbackIcon?: string
  width?: number
  height?: number
  style?: React.CSSProperties
  className?: string
}

export default function RecipeImage({
  src,
  alt,
  fallbackIcon = '🍽️',
  width = 400,
  height = 200,
  style,
}: RecipeImageProps) {
  if (!src) {
    return (
      <div style={{
        width: '100%',
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#faf8f5',
        fontSize: '48px',
        ...style,
      }}>
        {fallbackIcon}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{
        width: '100%',
        height: height,
        objectFit: 'cover',
        ...style,
      }}
      unoptimized // 外部URLの場合に必要なことがある
    />
  )
}
