import React from 'react'

import { ClickToLoadEmbed } from '@/landing/ui/ClickToLoadEmbed'
import type { YouTubeBlock as YouTubeBlockProps } from '@/payload-types'

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
      <div className="relative aspect-video w-full overflow-hidden rounded-chip">
        <ClickToLoadEmbed
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          // Na mobilu je 16:9 jen ~190 px, takže zástupný rámeček má menší svislé odsazení.
          frameClassName="absolute inset-0 h-full w-full gap-2 py-3 md:gap-3 md:py-8"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube video"
        />
      </div>
    </div>
  )
}
