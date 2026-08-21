import type { Metadata } from 'next'

import { notFound, redirect } from 'next/navigation'

import { getCachedRedirects } from '@/utilities/getRedirects'

/**
 * Catch-all pro staré eStránky URL /fotoalbum/... — 301 přes kolekci redirects
 * na nové /fotogalerie/{slug}. Odkazy na detail fotky (…/foto.jpg.html) se
 * mapují na nejbližší nadřazené album (longest prefix).
 */
type Args = {
  params: Promise<{ rest: string[] }>
}

export default async function LegacyFotoalbumRedirect({ params }: Args) {
  const { rest } = await params
  const url = `/fotoalbum/${rest.map(decodeURIComponent).join('/')}`

  const redirects = await getCachedRedirects()()

  // přesná shoda, pak nejdelší prefix (detaily fotek → album)
  const exact = redirects.find((r) => r.from === url)
  const match =
    exact ??
    redirects
      .filter((r) => r.from.startsWith('/fotoalbum/') && url.startsWith(r.from))
      .sort((a, b) => b.from.length - a.from.length)[0]

  if (match?.to?.url) redirect(match.to.url)

  notFound()
}

export const metadata: Metadata = {
  robots: { index: false },
}
