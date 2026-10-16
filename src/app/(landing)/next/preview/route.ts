import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { getPayloadClient } from '@/landing/data/query'
import { safeEqual } from '@/lib/bearer'
import type { PreviewSearchParams } from '@/lib/generatePreviewPath'
import { getServerSideURL } from '@/lib/getURL'
import { isSafePreviewPath } from '@/lib/previewPath'

export async function GET(req: NextRequest): Promise<Response> {
  const payload = await getPayloadClient()

  const { searchParams } = new URL(req.url)

  // Typ parametrů žije v `lib` (ne tady), aby `lib` nesahal do `app/`; klíče
  // přes něj hlídají, že handler čte totéž, co generátor zapisuje.
  const path = searchParams.get('path' satisfies keyof PreviewSearchParams)
  const previewSecret = searchParams.get('previewSecret' satisfies keyof PreviewSearchParams)

  // Prázdný `PREVIEW_SECRET` nepustí nikoho (`PREVIEW_SECRET=` a
  // `?previewSecret=` by se jinak rovnaly); porovnání v konstantním čase.
  const expectedSecret = process.env.PREVIEW_SECRET
  if (!expectedSecret || !previewSecret || !safeEqual(previewSecret, expectedSecret)) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  if (!path) {
    return new Response('Insufficient search params', { status: 404 })
  }

  // `//evil.com` i `/\evil.com` splňují `startsWith('/')` — prohlížeč je ale
  // čte jako protokol-relativní URL a přesměruje na cizí doménu (open redirect).
  if (!isSafePreviewPath(path, getServerSideURL())) {
    return new Response('This endpoint can only be used for relative previews', { status: 500 })
  }

  let user

  try {
    const authResult = await payload.auth({ headers: req.headers })
    user = authResult.user
  } catch (error) {
    payload.logger.error({ err: error }, 'Error verifying token for live preview')
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  const draft = await draftMode()

  if (!user) {
    draft.disable()
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  // You can add additional checks here to see if the user is allowed to preview this page

  draft.enable()

  redirect(path)
}
