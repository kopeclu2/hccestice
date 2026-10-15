import 'server-only'

import { draftMode } from 'next/headers'
import { cache } from 'react'

import { getPayloadClient } from '@/landing/data/query'
import type { Page } from '@/payload-types'

/**
 * Dokumenty kolekce `pages` — domovská stránka (`home`) i `/[slug]`.
 *
 * Bez `unstable_cache`: obě routy jsou prerenderované s ISR a invaliduje je
 * `revalidatePage`, takže by tagová cache jen přidala druhou vrstvu, kterou
 * by bylo nutné hlídat. React `cache()` stačí na sloučení dotazu z
 * `generateMetadata` a z komponenty v rámci jednoho renderu.
 */

/**
 * Stránka podle slugu. Čte `draftMode()`, takže v náhledu vrací i koncepty
 * (a obchází přístupová pravidla — přihlášený redaktor); mimo náhled jen
 * publikované. `slug: 'home'` je domovská stránka.
 */
export const fetchPageBySlug = cache(async (slug: string): Promise<Page | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: { slug: { equals: slug } },
    depth: 2,
  })

  return result.docs?.[0] ?? null
})

/**
 * Slugy publikovaných stránek pro `generateStaticParams` — bez `home`,
 * ta žije na `/` a `/home` se přesměrovává.
 */
export async function fetchPageSlugs(): Promise<string[]> {
  const payload = await getPayloadClient()
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return pages.docs.flatMap(({ slug }) => (slug && slug !== 'home' ? [slug] : []))
}
