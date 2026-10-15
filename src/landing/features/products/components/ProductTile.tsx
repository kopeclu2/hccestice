import { Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { uploadToPhoto } from '@/landing/lib/media'
import { Badge } from '@/landing/ui/Badge'
import { CardTitle } from '@/landing/ui/Heading'
import { PillLink } from '@/landing/ui/PillLink'
import { getMediaUrl } from '@/lib/getMediaUrl'
import type { Product } from '@/payload-types'

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
    <article className="flex h-full flex-col rounded-tile bg-surface p-4.5 md:p-5 lg:p-5.5">
      {/* produktovky mají bílé pozadí a různé poměry → contain, ne cover */}
      <MaybeLink
        className="relative block aspect-square overflow-hidden rounded-badge bg-chip"
        href={detailHref}
      >
        {/* `sizes` kopíruje zlomy mřížky výš (`sm:grid-cols-2 lg:grid-cols-3`).
            Dřív tu byl jediný zlom na 48rem, takže mezi 768 a 1024 px se do
            poloviční dlaždice tahala třetinová fotka — rozmazaně. */}
        {photo && (
          <Image
            alt={photo.alt}
            className="object-contain p-5"
            fill
            sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw"
            src={getMediaUrl(photo.url, photo.updatedAt)}
          />
        )}
      </MaybeLink>
      <div className="mt-4 flex items-start justify-between gap-3">
        <CardTitle as="h3" size="xs">
          <MaybeLink className="transition-colors hover:text-club" href={detailHref}>
            {product.name}
          </MaybeLink>
        </CardTitle>
        <Badge className="tabular-nums" variant="lime">
          {product.price} Kč
        </Badge>
      </div>
      {product.description && (
        <p className="mt-1.5 text-sm leading-relaxed text-dim">{product.description}</p>
      )}
      {(product.sizes ?? []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(product.sizes ?? []).map((size) => (
            <Badge key={size.id} size="xs" title={size.note ?? undefined} variant="chip">
              {size.label}
              {size.note && <span className="font-medium text-faint"> · {size.note}</span>}
            </Badge>
          ))}
        </div>
      )}
      {product.orderNote && (
        <p className="mt-2 text-xs font-medium text-faint">⚠ {product.orderNote}</p>
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
