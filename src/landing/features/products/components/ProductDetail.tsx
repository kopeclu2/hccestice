import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { ProductGallery } from '@/landing/features/products/components/ProductGallery'
import { ProductInfo } from '@/landing/features/products/components/ProductInfo'
import type { ProductPhoto } from '@/landing/features/products/photos'
import type { Product } from '@/payload-types'

/**
 * Detail produktu — layout podle shadcnblocks „product-detail1"
 * (mřížka fotek vlevo, název/cena/parametry vpravo) v klubovém
 * designu. Objednávky běží e-mailem, ne košíkem.
 */
export function ProductDetail({
  product,
  photos,
  email,
}: {
  product: Product
  photos: ProductPhoto[]
  email: string
}) {
  return (
    <div className="mx-auto max-w-[80rem] pt-10">
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-faint transition-colors hover:text-club [&_svg]:size-4"
        href="/produkty-merch"
      >
        <ArrowLeft strokeWidth={2.5} /> Zpět na Produkty merch
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery photos={photos} productName={product.name} />
        <ProductInfo email={email} product={product} />
      </div>
    </div>
  )
}
