import type { YouTubeBlock as YouTubeBlockProps } from '@/payload-types'

import React from 'react'

function extractVideoId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/,
  )
  return m ? m[1] : null
}

export const YouTubeBlock: React.FC<YouTubeBlockProps & { id?: string }> = ({ id, url }) => {
  const videoId = extractVideoId(url)
  if (!videoId) return null

  return (
    <div className="container" id={`block-${id}`}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  )
}
