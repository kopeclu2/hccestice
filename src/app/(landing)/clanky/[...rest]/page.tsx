import type { Metadata } from 'next'
import React from 'react'

import { PayloadRedirects } from '@/components/PayloadRedirects'

type Args = {
  params: Promise<{ rest: string[] }>
}

/**
 * Catch-all pro staré eStránky URL /clanky/{slug}.html — 308 přes kolekci
 * redirects (plněno importem) na nové /aktuality/{slug} resp. /{slug}.
 *
 * **Nad touto routou nesmí být `loading.tsx`.** Suspense boundary z něj
 * nastartuje streaming, takže `permanentRedirect` v `PayloadRedirects`
 * nemá kam poslat hlavičku a Next ho degraduje na klientský
 * `<meta http-equiv="refresh">` s HTTP **200** (ověřeno: s globálním
 * `loading.tsx` vracela tahle cesta 200, bez něj 308). Přesun redirectu
 * do `generateMetadata` to neřeší — boundary je i nad ní.
 */
export default async function LegacyClankyRedirect({ params }: Args) {
  const { rest } = await params
  const url = `/clanky/${rest.map(decodeURIComponent).join('/')}`

  return <PayloadRedirects url={url} />
}

export const metadata: Metadata = {
  robots: { index: false },
}
