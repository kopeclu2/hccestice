import React from 'react'

import type { RawHtmlBlock as RawHtmlBlockProps } from '@/payload-types'

export const RawHtmlBlock: React.FC<RawHtmlBlockProps> = ({ html }) => {
  if (!html) return null

  return (
    <div className="container">
      {/* Legacy obsah importovaný z eStránky — rendrováno jako HTML */}
      <div className="legacy-html prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
