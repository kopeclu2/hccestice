import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { fetchSite } from '@/landing/data/site'
import { ProductDetail } from '@/landing/features/products/components/ProductDetail'
import { ProductJsonLd } from '@/landing/features/products/components/ProductJsonLd'
import { fetchProductBySlug, fetchProductSlugs } from '@/landing/features/products/data'
import { collectPhotos } from '@/landing/features/products/photos'
import { BreadcrumbsJsonLd } from '@/landing/layout/BreadcrumbsJsonLd'
import { SubpageShell } from '@/landing/layout/SubpageShell'

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
 *
 * `SubpageShell`, ne holý `PageCanvas` — stránka dřív neměla ani navigaci,
 * ani patičku, protože tenhle jediný ručně psaný detail si je (na rozdíl
 * od zbytku landing routes) sám netahal. Zpětný odkaz mířil na `/#kontakt`
 * (kotva na homepage), ne na `/produkty-merch`, kde reálně žije mřížka
 * produktů (`ProductsGridBlockComponent`) — návrat z detailu vedl jinam,
 * než odkud se na produkt dalo prokliknout.
 */
export default async function ProductDetailPage({ params }: Args) {
  const { slug } = await params
  const [product, site] = await Promise.all([
    fetchProductBySlug(decodeURIComponent(slug)),
    fetchSite(),
  ])
  if (!product) notFound()

  const photos = collectPhotos(product)

  return (
    <SubpageShell gutter="wide" hatch={false} surface="paper">
      <ProductJsonLd photos={photos} product={product} />
      <BreadcrumbsJsonLd
        trail={[{ href: '/produkty-merch', label: 'Produkty merch' }, { label: product.name }]}
      />
      <ProductDetail email={site.email} photos={photos} product={product} />
    </SubpageShell>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await fetchProductBySlug(decodeURIComponent(slug))
  if (!product) return { title: 'Produkt nenalezen | HC Čestice' }
  return {
    alternates: { canonical: `/produkty/${product.slug}` },
    title: `${product.name} — ${product.price} Kč | HC Čestice merch`,
    description:
      product.description ?? `${product.name} z klubové nabídky HC Čestice. Objednávky e-mailem.`,
  }
}
