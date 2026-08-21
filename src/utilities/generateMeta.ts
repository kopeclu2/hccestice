import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

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
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title
    ? htmlPlainText(doc.meta.title) + ' | HC Čestice'
    : 'HC Čestice'

  // Popisy naimportované z eStránky bývají celý HTML odstavec — do meta tagu
  // patří prostý text, jinak se do stránky propíšou `&lt;p&gt;…`
  const description = snippet(htmlPlainText(doc?.meta?.description || ''), 160) || undefined

  return {
    description,
    openGraph: mergeOpenGraph({
      description: description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
