import React from 'react'

import { fetchSite, fetchSiteConfig, mapFooter } from '../data/site'

import { ArticleNav } from '../article/ArticleNav'
import { LandingFooter } from './LandingFooter'
import { PageCanvas, type PageCanvasProps } from './PageCanvas'

/**
 * Kompletní obal podstránky: podklad + globální navigace + obsah + patička.
 *
 * Osm podstránek si tuhle trojici (`ArticleNav`, obsah, `LandingFooter`)
 * skládalo ručně a k tomu si samo tahalo `fetchSiteConfig`/`fetchSite`/
 * `mapFooter` jen kvůli patičce. Data si proto bere shell sám —
 * `fetchSiteConfig` je obalený v React `cache()`, takže když je stránka
 * potřebuje i pro sebe (`site` pro CTA se sítěmi), nic se nefetchuje dvakrát.
 */
export async function SubpageShell({
  children,
  gutter,
  hatch,
  surface = 'subpage',
}: Pick<PageCanvasProps, 'gutter' | 'hatch' | 'surface'> & {
  children: React.ReactNode
}) {
  const [siteConfig, site] = await Promise.all([fetchSiteConfig(), fetchSite()])

  return (
    <PageCanvas gutter={gutter} hatch={hatch} surface={surface}>
      <ArticleNav />
      {children}
      <LandingFooter content={mapFooter(siteConfig)} site={site} />
    </PageCanvas>
  )
}
