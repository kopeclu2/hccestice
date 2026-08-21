import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

/**
 * Hero CMS stránek (`pages`), varianta „highImpact" — fotka na celou plochu.
 *
 * Dřív to byla klientská komponenta jen proto, aby přes `useHeaderTheme`
 * ztmavila Header Payload šablony; ten už neexistuje, takže je z ní zpátky
 * server komponenta. Zmizel s ním i `-mt-[10.4rem]` (kompenzace výšky
 * šablonového headeru, pod klubovou navigací by hero podjelo) a
 * `data-theme="dark"` — to by dnes přepnulo landing tokeny celého podstromu.
 */
export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="relative flex items-center justify-center text-white">
      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-[36.5rem] md:text-center">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="-z-10 object-cover" priority resource={media} />
        )}
      </div>
    </div>
  )
}
