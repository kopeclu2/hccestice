import type React from 'react'
import type { Page, Post } from '@/payload-types'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { notFound, permanentRedirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  url: string
}

// URL prefix cílové kolekce — články žijí na /aktuality, ne /posts.
// Díky mapě jde legacy redirect (reference na dokument) jedním hopem na finální URL.
const collectionPrefix = (relationTo: string): string =>
  relationTo === 'pages' ? '' : relationTo === 'posts' ? '/aktuality' : `/${relationTo}`

/**
 * SSR redirecty z kolekce `redirects` (plní je legacy import z eStránek).
 *
 * Používá se `permanentRedirect` (308), ne `redirect` — ten posílá
 * **307 Temporary**
 * (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`,
 * „Why does `redirect` use 307 and 308?"). Statická pravidla v
 * `redirects.ts` mají `permanent: true`, takže dvě cesty ke stejnému cíli
 * se dřív rozcházely: crawler starou URL z indexu nevyřadil a prohlížeč
 * si redirect necachoval.
 */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const redirects = await getCachedRedirects()()

  const redirectItem = redirects.find((redirect) => redirect.from === url)

  if (redirectItem) {
    if (redirectItem.to?.url) {
      permanentRedirect(redirectItem.to.url)
    }

    let redirectUrl: string

    if (typeof redirectItem.to?.reference?.value === 'string') {
      const collection = redirectItem.to?.reference?.relationTo
      const id = redirectItem.to?.reference?.value

      const document = (await getCachedDocument(collection, id)()) as Page | Post
      redirectUrl = `${collectionPrefix(redirectItem.to?.reference?.relationTo ?? '')}/${
        document?.slug
      }`
    } else {
      redirectUrl = `${collectionPrefix(redirectItem.to?.reference?.relationTo ?? '')}/${
        typeof redirectItem.to?.reference?.value === 'object'
          ? redirectItem.to?.reference?.value?.slug
          : ''
      }`
    }

    if (redirectUrl) permanentRedirect(redirectUrl)
  }

  if (disableNotFound) return null

  notFound()
}
