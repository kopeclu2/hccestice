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

  const title = brandTitle(doc?.meta?.title ? htmlPlainText(doc.meta.title) : null)

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
    description,
    // `type` se nedá dosadit výrazem — `openGraph` je diskriminovaná unie,
    // takže se větví celý objekt.
    openGraph: mergeOpenGraph(
      collection === 'posts'
        ? { description: description || '', images, title, type: 'article', url }
        : { description: description || '', images, title, url },
    ),
    title,
  }
}
