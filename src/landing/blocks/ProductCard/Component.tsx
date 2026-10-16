import React from 'react'

import { fetchSite } from '@/landing/data/site'
import { ProductTile } from '@/landing/features/products/components/ProductTile'
import { fetchProduct } from '@/landing/features/products/data'
import { relId } from '@/landing/lib/payload'
import { Kicker } from '@/landing/ui/Kicker'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import type { ProductCardBlock } from '@/payload-types'

/** Karta jednoho produktu — vypíchnutí konkrétního merche. */
export async function ProductCardBlockComponent({ block }: { block: ProductCardBlock }) {
  const productId = relId(block.product)
  if (!productId) return null

  const [product, site] = await Promise.all([fetchProduct(productId), fetchSite()])
  if (!product) return null

  return (
    <SectionShell>
      <Reveal>
        <div className="mx-auto max-w-100">
          {block.kicker && (
            <div className="mb-4 text-center">
              <Kicker>{block.kicker}</Kicker>
            </div>
          )}
          <ProductTile ctaLabel="Objednat e-mailem" email={site.email} product={product} />
          {!product.available && (
            <p className="mt-3 text-center text-sm font-medium text-faint">
              Momentálně mimo nabídku.
            </p>
          )}
        </div>
      </Reveal>
    </SectionShell>
  )
}
