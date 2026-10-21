import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { decodeSegments } from '@/lib/decodeSlug'
import { legacyClankyCandidates, legacyClankyFallback } from '@/lib/legacyUrl'

type Args = {
  params: Promise<{ rest: string[] }>
}

/**
 * Catch-all pro staré eStránky URL /clanky/… — 308 přes kolekci redirects
 * (plněno importem) na nové /aktuality/{slug} resp. /{slug}.
 *
 * Import zakládal přesměrování jen z ploché adresy `/clanky/<název>.html`,
 * zanořené `/clanky/archivy/<sezóna>/<kategorie>/…/<název>.html` proto
 * zkouší i plochý tvar (`legacyClankyCandidates`) a indexové stránky sekcí
 * jdou na výpis (`legacyClankyFallback`). Viz `lib/legacyUrl`.
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
  // Neplatné `%`-kódování je 404, ne 500 (viz `lib/decodeSlug`).
  const segments = decodeSegments(rest)
  if (!segments) notFound()

  // Postupně, ne vedle sebe: `PayloadRedirects` při shodě vyhodí přesměrování
  // a u dvou souběžných by o vítězi rozhodlo pořadí dokončení.
  for (const url of legacyClankyCandidates(segments)) {
    await PayloadRedirects({ url, disableNotFound: true })
  }

  const fallback = legacyClankyFallback(segments)
  if (fallback) permanentRedirect(fallback)

  notFound()
}

export const metadata: Metadata = {
  robots: { index: false },
}
