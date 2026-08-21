import type { ProductCardBlock } from '@/payload-types'

import React from 'react'

import { Kicker } from '../../components/Kicker'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { relId } from '../../data/format'
import { fetchProduct } from '../../data/products'
import { fetchSite } from '../../data/site'
import { ProductTile } from '../ProductsGrid/Component'

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
            <p className="text-faint mt-3 text-center text-meta font-semibold">
              Momentálně mimo nabídku.
            </p>
          )}
        </div>
      </Reveal>
    </SectionShell>
  )
}
