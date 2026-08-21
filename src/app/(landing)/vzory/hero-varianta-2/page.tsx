import type { Media } from '@/payload-types'
import type { Metadata } from 'next'

import React from 'react'

import { HeroModernBlockComponent } from '@/landing/blocks/HeroModern/Component'
import { PageCanvas } from '@/landing/components/PageCanvas'
import { HERO } from '@/landing/content'

/**
 * Interní náhled hero varianty 2 (blok `landingHeroModern`).
 *
 * Existuje proto, že sekce se jinak dá vidět jen po vložení bloku na
 * homepage v adminu — což znemožňuje kontrolu responzivity při vývoji
 * a hlavně srovnání s variantou 1 na `/`.
 *
 * Blok se sem předává jako literál, ne z databáze: náhled má ukazovat
 * komponentu, ne aktuální obsah CMS. Fotka je proto podvržená přímo
 * souborem z `public/media` (tentýž snímek, jaký má jako fallback
 * `content.ts`) — bez fotky se nedá posoudit ani čitelnost textu, ani
 * zelený filtr přes ni.
 */
const PREVIEW_PHOTO = {
  // `/api/media/file/**` je jediná cesta k médiím povolená v
  // `next.config.ts#images.localPatterns` — `/media/...` next/image odmítne.
  url: `/api/media/file/${HERO.photo}`,
  alt: 'Tým HC Čestice na ledě',
  width: 1920,
  height: 1440,
} as Media

export default function HeroVariant2PreviewPage() {
  return (
    <PageCanvas hatch={false} surface="paper">
      <div className="px-3.5 pt-3.5">
        <HeroModernBlockComponent
          block={{ blockType: 'landingHeroModern', photo: PREVIEW_PHOTO }}
        />
      </div>
    </PageCanvas>
  )
}

export const metadata: Metadata = {
  title: 'Hero varianta 2 — interní náhled',
  robots: { index: false, follow: false },
}
