import type { Metadata } from 'next'

import React from 'react'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { fetchGalleryBySlug, fetchGallerySlugs } from '@/landing/data/galleries'
import { formatLongDate, toPhoto, uploadToPhoto } from '@/landing/data/format'
import { seasonShortLabel } from '@/landing/data/seasons'
import { GalleryDetailHeader } from '@/landing/fotogalerie/GalleryDetailHeader'
import { PhotoMasonry, type GalleryPhoto } from '@/landing/fotogalerie/PhotoMasonry'
import { PhotosCta } from '@/landing/fotogalerie/PhotosCta'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getServerSideURL } from '@/utilities/getURL'

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
  const slug = decodeURIComponent(rawSlug)

  const gallery = await fetchGalleryBySlug(slug)
  if (!gallery) return <PayloadRedirects url={`/fotogalerie/${slug}`} />

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

      <div className="relative z-1 mx-auto mt-9 max-w-[97.5rem] px-[clamp(0.875rem,3vw,2.5rem)]">
        <PhotoMasonry photos={photos} />
      </div>

      <PhotosCta />
    </SubpageShell>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const gallery = await fetchGalleryBySlug(slug)
  if (!gallery) return { title: 'Galerie nenalezena | HC Čestice' }

  const cover = uploadToPhoto(gallery.cover)
  return {
    title: `${gallery.title} | Fotoalbum HC Čestice`,
    description: `Fotogalerie ${gallery.title} — ${gallery.photos?.length ?? 0} fotek.`,
    alternates: { canonical: `/fotogalerie/${slug}` },
    openGraph: cover
      ? { images: [{ url: `${getServerSideURL()}${getMediaUrl(cover.url)}` }] }
      : undefined,
  }
}
