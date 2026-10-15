import { Megaphone } from 'lucide-react'
import React from 'react'

import { fetchSite } from '@/landing/data/site'
import { ProductTile } from '@/landing/features/products/components/ProductTile'
import { fetchProducts } from '@/landing/features/products/data'
import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import type { ProductsGridBlock } from '@/payload-types'

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
          <div className="mb-8 flex items-start gap-3.5 rounded-tile bg-club px-4.5 py-4 text-on-contrast md:px-5 lg:px-5.5 lg:py-4.5">
            <Megaphone className="mt-0.5 size-5 flex-none" strokeWidth={2.25} />
            <p className="text-sm leading-relaxed font-semibold whitespace-pre-line">
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
