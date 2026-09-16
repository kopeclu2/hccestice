import React from 'react'

import { fetchSite, fetchSiteConfig, mapFooter } from '../data/site'

import { ArticleNav } from '../article/ArticleNav'
import { PatternBackground, type PatternFade, type PatternTone, type PatternVariant } from './PatternBackground'
import { LandingFooter } from './LandingFooter'
import { PageCanvas, type PageCanvasProps } from './PageCanvas'

export type SubpagePattern = {
  variant: PatternVariant
  tone?: PatternTone
  fade?: PatternFade
}

/**
 * Kompletní obal podstránky: podklad + globální navigace + obsah + patička.
 *
 * Osm podstránek si tuhle trojici (`ArticleNav`, obsah, `LandingFooter`)
 * skládalo ručně a k tomu si samo tahalo `fetchSiteConfig`/`fetchSite`/
 * `mapFooter` jen kvůli patičce. Data si proto bere shell sám —
 * `fetchSiteConfig` je obalený v React `cache()`, takže když je stránka
 * potřebuje i pro sebe (`site` pro CTA se sítěmi), nic se nefetchuje dvakrát.
 *
 * `pattern` je volitelný tichý orientační vzor v horní části stránky
 * (`PatternBackground`, dřív žil jen na `/vzory`). Prop, ne detekce podle
 * `pathname` — `headers()`/`usePathname()` by byly dynamické API a zrušily
 * by prerender jinak statických podstránek (viz pravidla cache v AGENTS.md).
 * Zabalený do vlastní výšky s `overflow-hidden`: fade masky `PatternBackground`
 * počítají v procentech výšky boxu, takže bez stropu by se na dlouhé stránce
 * (`/zapasy`, `/fotogalerie`) vytratily až stovky pixelů pod headerem.
 */
export async function SubpageShell({
  children,
  gutter,
  hatch,
  pattern,
  surface = 'subpage',
}: Pick<PageCanvasProps, 'gutter' | 'hatch' | 'surface'> & {
  children: React.ReactNode
  pattern?: SubpagePattern
}) {
  const [siteConfig, site] = await Promise.all([fetchSiteConfig(), fetchSite()])

  return (
    <PageCanvas gutter={gutter} hatch={hatch} surface={surface}>
      {pattern && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-1 hidden h-[56rem] overflow-hidden lg:block"
        >
          <PatternBackground fade={pattern.fade ?? 'top'} tone={pattern.tone} variant={pattern.variant} />
        </div>
      )}
      <ArticleNav />
      {children}
      <LandingFooter content={mapFooter(siteConfig)} site={site} />
    </PageCanvas>
  )
}
