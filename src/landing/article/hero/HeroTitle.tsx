import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Titulek se zvýrazněnou podčástí (`titleHighlight` z Payloadu).
 *
 * Vrací jen obsah — element `h1` a jeho velikost/barvu si každá
 * hero varianta drží u sebe.
 *
 * - `lime-text` — zvýrazněná část lime barvou písma (foto, zápas)
 * - `lime-box`  — lime podbarvení à la zvýrazňovač (rozdělené, typografické)
 * - `none`      — bez zvýraznění (zelený panel)
 */
export function TitleParts({
  title,
  highlight,
  accent,
  highlightClassName,
}: {
  title: string
  highlight: string | null
  accent: 'lime-text' | 'lime-box' | 'none'
  /** Doplňkové třídy zvýraznění (typografická varianta přidává tučnost). */
  highlightClassName?: string
}) {
  if (!highlight || accent === 'none') return <>{title}</>

  const index = title.indexOf(highlight)
  if (index === -1) return <>{title}</>

  return (
    <>
      {title.slice(0, index)}
      <span
        className={cn(
          accent === 'lime-box' ? 'bg-lime text-ink box-decoration-clone px-2' : 'text-lime',
          highlightClassName,
        )}
      >
        {highlight}
      </span>
      {title.slice(index + highlight.length)}
    </>
  )
}
