import type { Metadata } from 'next'
import type { Media, Product } from '@/payload-types'

import { ArrowLeft, CircleCheck, CircleX, Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { PageCanvas } from '@/landing/components/PageCanvas'
import { CardTitle, PageTitle } from '@/landing/components/Heading'
import { Kicker } from '@/landing/components/Kicker'
import { Numeral } from '@/landing/components/Numeral'
import { PillLink } from '@/landing/components/PillLink'
import { fetchProductBySlug, fetchProductSlugs } from '@/landing/data/products'
import { fetchSite } from '@/landing/data/site'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

export const revalidate = 600

export async function generateStaticParams() {
  const slugs = await fetchProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

type Args = { params: Promise<{ slug: string }> }

/**
 * Detail produktu — layout podle shadcnblocks „product-detail1"
 * (mřížka fotek vlevo, název/cena/parametry vpravo) v klubovém
 * designu. Objednávky běží e-mailem, ne košíkem.
 */
export default async function ProductDetailPage({ params }: Args) {
  const { slug } = await params
  const [product, site] = await Promise.all([
    fetchProductBySlug(decodeURIComponent(slug)),
    fetchSite(),
  ])
  if (!product) notFound()

  const photos = collectPhotos(product)
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`Objednávka: ${product.name}`)}`

  return (
    <PageCanvas className="min-h-screen" gutter="wide" hatch={false} surface="paper">
      <div className="mx-auto max-w-[80rem] pt-10">
        <Link
          className="text-faint hover:text-club inline-flex items-center gap-2 text-meta font-bold transition-colors [&_svg]:size-4"
          href="/#kontakt"
        >
          <ArrowLeft strokeWidth={2.5} /> Zpět na web klubu
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* fotky: první přes celou šířku, další jako mřížka */}
          <div className="grid grid-cols-3 gap-4">
            {photos.length === 0 && (
              <div className="bg-chip col-span-3 aspect-square rounded-panel" />
            )}
            {photos.map((photo, index) => (
              <div
                className={cn(
                  'bg-chip relative overflow-hidden rounded-panel',
                  index === 0 ? 'col-span-3 aspect-[4/3]' : 'aspect-square',
                )}
                key={index}
              >
                <Image
                  alt={photo.alt || product.name}
                  className="object-contain p-6"
                  fill
                  priority={index === 0}
                  sizes={index === 0 ? '(max-width: 64rem) 100vw, 40rem' : '13rem'}
                  src={getMediaUrl(photo.url)}
                />
              </div>
            ))}
          </div>

          {/* informace */}
          <div className="space-y-6">
            <div>
              <Kicker>Klubový merch</Kicker>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <PageTitle size="sm">{product.name}</PageTitle>
                <Numeral
                  className="bg-lime text-ink rounded-full px-4 py-1.5 whitespace-nowrap"
                  size="sm"
                >
                  {product.price} Kč
                </Numeral>
              </div>
              <div className="mt-3">
                {product.available ? (
                  <span className="text-club inline-flex items-center gap-1.5 text-meta font-bold [&_svg]:size-4">
                    <CircleCheck strokeWidth={2.5} /> V nabídce
                  </span>
                ) : (
                  <span className="text-faint inline-flex items-center gap-1.5 text-meta font-bold [&_svg]:size-4">
                    <CircleX strokeWidth={2.5} /> Momentálně mimo nabídku
                  </span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-dim leading-relaxed text-pretty">{product.description}</p>
            )}

            {(product.sizes ?? []).length > 0 && (
              <div>
                <CardTitle className="mb-3" size="xs">
                  Velikosti
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes ?? []).map((size) => (
                    <span
                      className="border-line rounded-xl border bg-surface px-4 py-2 text-meta font-bold"
                      key={size.id}
                    >
                      {size.label}
                      {size.note && (
                        <span className="text-faint font-semibold"> · {size.note}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.available && (
              <div>
                <PillLink
                  className="w-full justify-center py-3.5 [&_svg]:size-4.5"
                  href={mailto}
                  variant="dark"
                >
                  <Mail strokeWidth={2.5} /> Objednat e-mailem
                </PillLink>
                <p className="text-faint mt-2 text-center text-caption font-semibold">
                  {product.orderNote ??
                    'V objednávce uveďte název předmětu, velikost a počet kusů.'}
                </p>
              </div>
            )}

            {(product.params ?? []).length > 0 && (
              <div className="rounded-panel bg-surface p-6">
                <CardTitle className="mb-2" size="xs">
                  Parametry
                </CardTitle>
                <dl>
                  {(product.params ?? []).map((param) => (
                    <div
                      className="border-line-soft flex items-center justify-between gap-6 border-b py-3 last:border-b-0"
                      key={param.id}
                    >
                      <dt className="text-faint text-meta font-semibold">{param.label}</dt>
                      <dd className="text-right text-meta font-bold">{param.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageCanvas>
  )
}

/** Hlavní fotka + galerie → jednotný seznam pro mřížku. */
function collectPhotos(product: Product): Array<{ url: string; alt: string }> {
  const photos: Array<{ url: string; alt: string }> = []
  if (typeof product.photo === 'object' && product.photo?.url) {
    photos.push({ url: product.photo.url, alt: product.photo.alt ?? '' })
  }
  for (const row of product.gallery ?? []) {
    const image = row.image as Media | number
    if (typeof image === 'object' && image?.url) {
      photos.push({ url: image.url, alt: image.alt ?? '' })
    }
  }
  return photos
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await fetchProductBySlug(decodeURIComponent(slug))
  if (!product) return { title: 'Produkt nenalezen | HC Čestice' }
  return {
    title: `${product.name} — ${product.price} Kč | HC Čestice merch`,
    description:
      product.description ?? `${product.name} z klubové nabídky HC Čestice. Objednávky e-mailem.`,
  }
}
