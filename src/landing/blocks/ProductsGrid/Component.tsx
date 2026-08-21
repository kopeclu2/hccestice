import type { Product, ProductsGridBlock } from '@/payload-types'

import { Mail, Megaphone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { getMediaUrl } from '@/utilities/getMediaUrl'

import { Badge } from '../../components/Badge'
import { CardTitle, SectionTitle } from '../../components/Heading'
import { Highlight } from '../../components/Kicker'
import { PillLink } from '../../components/PillLink'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { uploadToPhoto } from '../../data/format'
import { fetchProducts } from '../../data/products'
import { fetchSite } from '../../data/site'

/**
 * Produkty (merch) — mřížka zboží v nabídce + objednací instrukce.
 *
 * Prodej běží e-mailem: tlačítko u produktu předvyplní předmět zprávy
 * názvem produktu (adresa z Nastavení webu). Ceny a velikosti se
 * spravují v kolekci Produkty.
 */
export async function ProductsGridBlockComponent({ block }: { block: ProductsGridBlock }) {
  const [products, site] = await Promise.all([fetchProducts(), fetchSite()])
  if (products.length === 0) return null

  return (
    <SectionShell>
      <Reveal>
        {block.title && (
          <SectionTitle className="mb-6">
            <Highlight>{block.title}</Highlight>
          </SectionTitle>
        )}

        {block.orderInfo && (
          <div className="bg-club mb-8 flex items-start gap-3.5 rounded-tile px-5.5 py-4 text-white">
            <Megaphone className="mt-0.5 size-5 flex-none" strokeWidth={2.25} />
            <p className="text-meta leading-relaxed font-bold whitespace-pre-line">
              {block.orderInfo}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductTile
              ctaLabel={block.ctaLabel ?? 'Objednat e-mailem'}
              email={site.email}
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}

/** Karta produktu v mřížce — sdílí ji i widget Karta produktu. */
export function ProductTile({
  product,
  email,
  ctaLabel,
}: {
  product: Product
  email: string
  ctaLabel: string
}) {
  const mailto = `mailto:${email}?subject=${encodeURIComponent(`Objednávka: ${product.name}`)}`

  const photo = uploadToPhoto(product.photo)
  const detailHref = product.slug ? `/produkty/${product.slug}` : null

  return (
    <article className="flex h-full flex-col rounded-tile bg-surface p-4.5">
      {/* produktovky mají bílé pozadí a různé poměry → contain, ne cover */}
      <MaybeLink
        className="bg-chip relative block aspect-square overflow-hidden rounded-badge"
        href={detailHref}
      >
        {photo && (
          <Image
            alt={photo.alt}
            className="object-contain p-5"
            fill
            sizes="(max-width: 48rem) 100vw, 33vw"
            src={getMediaUrl(photo.url)}
          />
        )}
      </MaybeLink>
      <div className="mt-4 flex items-start justify-between gap-3">
        <CardTitle as="h3" size="xs">
          <MaybeLink className="hover:text-club transition-colors" href={detailHref}>
            {product.name}
          </MaybeLink>
        </CardTitle>
        <Badge className="tabular-nums" variant="lime">
          {product.price} Kč
        </Badge>
      </div>
      {product.description && (
        <p className="text-dim mt-1.5 text-meta leading-relaxed">{product.description}</p>
      )}
      {(product.sizes ?? []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(product.sizes ?? []).map((size) => (
            <Badge key={size.id} size="xs" title={size.note ?? undefined} variant="chip">
              {size.label}
              {size.note && <span className="text-faint font-semibold"> · {size.note}</span>}
            </Badge>
          ))}
        </div>
      )}
      {product.orderNote && (
        <p className="text-faint mt-2 text-caption font-semibold">⚠ {product.orderNote}</p>
      )}
      <div className="flex-1" />
      <PillLink className="mt-4 self-start" href={mailto} size="sm" variant="dark">
        <Mail strokeWidth={2.5} /> {ctaLabel}
      </PillLink>
    </article>
  )
}

/** Odkaz na detail produktu; bez slugu renderuje jen obal. */
function MaybeLink({
  href,
  className,
  children,
}: {
  href: string | null
  className?: string
  children: React.ReactNode
}) {
  if (!href) return <span className={className}>{children}</span>
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  )
}
