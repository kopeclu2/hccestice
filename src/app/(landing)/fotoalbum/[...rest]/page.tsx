import type { Metadata } from 'next'

import { notFound, permanentRedirect } from 'next/navigation'

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

  // `permanentRedirect` (308), ne `redirect` — ten posílá **307 Temporary**
  // (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md`,
  // „Why does `redirect` use 307 and 308?"). Staré eStránky URL se přesunuly
  // natrvalo; u 307 by je crawler držel v indexu a prohlížeč by si redirect
  // necachoval, takže každý příchod ze starého odkazu platí render routy.
  if (match?.to?.url) permanentRedirect(match.to.url)

  notFound()
}

export const metadata: Metadata = {
  robots: { index: false },
}
