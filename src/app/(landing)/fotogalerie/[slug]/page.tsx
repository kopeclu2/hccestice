import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { GalleryDetailHeader } from '@/landing/features/galleries/components/GalleryDetailHeader'
import {
  PhotoMasonry,
  type GalleryPhoto,
} from '@/landing/features/galleries/components/PhotoMasonry'
import { PhotosCta } from '@/landing/features/galleries/components/PhotosCta'
import { fetchGalleryBySlug, fetchGallerySlugs } from '@/landing/features/galleries/data'
import { seasonShortLabel } from '@/landing/features/matches/data/seasons'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { toPhoto, uploadToPhoto } from '@/landing/lib/media'
import { brandTitle } from '@/lib/brandTitle'
import { CLUB_NAME } from '@/lib/club'
import { formatLongDate } from '@/lib/datetime'
import { decodeSlug } from '@/lib/decodeSlug'
import { getMediaUrl } from '@/lib/getMediaUrl'
import { getServerSideURL } from '@/lib/getURL'
import { routes } from '@/lib/routes'

/** ISR pojistka — galerie nemají revalidační hook, obnoví se samy. */
export const revalidate = 600

export async function generateStaticParams() {
  const slugs = await fetchGallerySlugs()
  return slugs.map((slug) => ({ slug }))
}

type Args = { params: Promise<{ slug: string }> }

/**
 * Detail fotogalerie — mřížka fotek s lightboxem. Vlastní handoff design
 * neexistuje, stránka drží layoutový systém výpisu /fotogalerie.
 * Neexistující slug řeší `PayloadRedirects` (legacy redirecty z eStránek
 * míří i na detaily alb).
 */
export default async function GalleryDetailPage({ params }: Args) {
  const { slug: rawSlug } = await params
  const slug = decodeSlug(rawSlug)
  // Neplatné procentové kódování (`%zz`) je 404, ne 500.
  if (slug === null) notFound()

  const gallery = await fetchGalleryBySlug(slug)
  if (!gallery) return <PayloadRedirects url={routes.gallery(slug)} />

  const photos: GalleryPhoto[] = (gallery.photos ?? [])
    .map((row) => ({
      photo: typeof row.image === 'object' && row.image ? toPhoto(row.image) : null,
      caption: row.caption ?? null,
    }))
    .filter((row): row is GalleryPhoto => row.photo !== null)
  const season = typeof gallery.season === 'object' && gallery.season ? gallery.season : null

  return (
    <SubpageShell>
      <GalleryDetailHeader
        dateLabel={gallery.date ? formatLongDate(gallery.date) : null}
        photoCount={photos.length}
        seasonLabel={season ? seasonShortLabel(season) : null}
        title={gallery.title}
      />

      <div className="relative z-1 mx-auto mt-9 max-w-page px-gutter">
        <PhotoMasonry photos={photos} />
      </div>

      <PhotosCta />
    </SubpageShell>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeSlug(rawSlug)
  if (slug === null) return { title: brandTitle('Galerie nenalezena') }
  const gallery = await fetchGalleryBySlug(slug)
  if (!gallery) return { title: brandTitle('Galerie nenalezena') }

  const cover = uploadToPhoto(gallery.cover)
  return {
    title: `${gallery.title} | Fotoalbum ${CLUB_NAME}`,
    description: `Fotogalerie ${gallery.title} — ${gallery.photos?.length ?? 0} fotek.`,
    alternates: { canonical: routes.gallery(slug) },
    openGraph: cover
      ? { images: [{ url: `${getServerSideURL()}${getMediaUrl(cover.url, cover.updatedAt)}` }] }
      : undefined,
  }
}
