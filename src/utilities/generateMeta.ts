import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { brandTitle } from './brandTitle'
import { mergeOpenGraph, OG_FALLBACK_IMAGE } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { htmlPlainText, snippet } from './plainText'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + OG_FALLBACK_IMAGE

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  /**
   * Ze které kolekce dokument je — rozhoduje o `og:url` a `og:type`.
   * Volitelné jen kvůli zpětné kompatibilitě; `pages` je výchozí.
   */
  collection?: 'pages' | 'posts'
}): Promise<Metadata> => {
  const { collection = 'pages', doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  // Fallback na hlavní nadpis dokumentu, když redaktor nevyplnil SEO záložku
  // (běžné u naimportovaných článků) — jinak title padne rovnou na "HC
  // Čestice" a Google to napříč dokumenty vidí jako duplicitní title tag.
  const rawTitle = doc?.meta?.title || doc?.title || null
  const title = brandTitle(rawTitle ? htmlPlainText(rawTitle) : null)

  // Popisy naimportované z eStránky bývají celý HTML odstavec — do meta tagu
  // patří prostý text, jinak se do stránky propíšou `&lt;p&gt;…`
  const description = snippet(htmlPlainText(doc?.meta?.description || ''), 160) || undefined

  /**
   * `og:url` byl dřív `Array.isArray(doc?.slug) ? doc.slug.join('/') : '/'`.
   * `slug` je u `Page` i `Post` **string**, takže ta podmínka nikdy neplatila
   * a každá stránka webu inzerovala jako svoji OG adresu homepage — sdílený
   * článek pak na sítích odkazoval na `/` místo na sebe.
   */
  const slug = typeof doc?.slug === 'string' ? doc.slug : null
  const path =
    collection === 'posts'
      ? slug
        ? `/aktuality/${slug}`
        : '/aktuality'
      : !slug || slug === 'home'
        ? '/'
        : `/${slug}`

  const url = `${getServerSideURL()}${path}`
  const images = ogImage ? [{ url: ogImage }] : undefined

  return {
    /**
     * Canonical si dřív dosazovaly jen ručně psané landing routy
     * (`alternates` v jejich `metadata`), takže dokumenty z CMS — `/kontakty`,
     * `/nabor`, `/reklamni-predmety` — neměly `<link rel="canonical">` vůbec.
     * `path` se přitom počítá o pár řádků výš pro `og:url`; stačilo ho vrátit
     * i sem. Relativní hodnotu Next doplní o `metadataBase` z layoutu.
     */
    alternates: { canonical: path },
    description,
    // `type` se nedá dosadit výrazem — `openGraph` je diskriminovaná unie,
    // takže se větví celý objekt.
    openGraph: mergeOpenGraph(
      collection === 'posts'
        ? { description: description || '', images, title, type: 'article', url }
        : { description: description || '', images, title, url },
    ),
    // Vlastní `twitter`, ne dědění z layoutu: Next slučuje metadata mělce
    // podle segmentu, takže kdyby tenhle dokument twitter nedosadil, spadl
    // by na obecný `defaultTwitter` a sdílená karta na X by nesla titulek
    // webu i pro konkrétní článek.
    title,
    twitter: { card: 'summary_large_image', description, images, title },
  }
}
