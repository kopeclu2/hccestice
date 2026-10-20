import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { decodeSegments } from '@/lib/decodeSlug'

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
  // Neplatné procentové kódování (`%zz`) je 404, ne 500.
  const segments = decodeSegments(rest)
  if (!segments) notFound()
  const url = `/clanky/${segments.join('/')}`

  return <PayloadRedirects url={url} />
}

export const metadata: Metadata = {
  robots: { index: false },
}
