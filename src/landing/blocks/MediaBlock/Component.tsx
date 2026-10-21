import type { StaticImageData } from 'next/image'
import React from 'react'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/lib/utils'
import type { MediaBlock as MediaBlockProps } from '@/payload-types'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  /** `sizes` obrázku podle šířky sloupce; bez něj `100vw`. */
  imageSizes?: string
  /** LCP kandidát: `loading="eager"` + `fetchPriority="high"`. */
  priority?: boolean
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imageSizes,
    imgClassName,
    media,
    priority,
    staticImage,
    disableInnerContainer,
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  return (
    <div
      className={cn(
        '',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      {(media || staticImage) && (
        <Media
          imgClassName={cn('rounded-field border border-border', imgClassName)}
          priority={priority}
          resource={media}
          size={imageSizes}
          src={staticImage}
        />
      )}
      {caption && (
        <div
          className={cn(
            'mt-6',
            {
              container: !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
    </div>
  )
}
