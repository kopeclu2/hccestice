import type { Metadata } from 'next'
import React from 'react'

import { PayloadRedirects } from '@/components/PayloadRedirects'

type Args = {
  params: Promise<{ rest: string[] }>
}

/**
 * Catch-all pro staré eStránky URL /clanky/{slug}.html — 301 přes kolekci
 * redirects (plněno importem) na nové /posts/{slug} resp. /{slug}.
 */
export default async function LegacyClankyRedirect({ params }: Args) {
  const { rest } = await params
  const url = `/clanky/${rest.map(decodeURIComponent).join('/')}`

  return <PayloadRedirects url={url} />
}

export const metadata: Metadata = {
  robots: { index: false },
}
