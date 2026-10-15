import { CircleCheck, CircleX, Mail } from 'lucide-react'
import React from 'react'

import { CardTitle, PageTitle } from '@/landing/ui/Heading'
import { Kicker } from '@/landing/ui/Kicker'
import { Numeral } from '@/landing/ui/Numeral'
import { PillLink } from '@/landing/ui/PillLink'
import type { Product } from '@/payload-types'

/** Informace o produktu: název, cena, dostupnost, velikosti, objednávka, parametry. */
export function ProductInfo({ product, email }: { product: Product; email: string }) {
  const mailto = `mailto:${email}?subject=${encodeURIComponent(`Objednávka: ${product.name}`)}`

  return (
    <div className="space-y-6">
      <div>
        <Kicker>Klubový merch</Kicker>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <PageTitle size="sm">{product.name}</PageTitle>
          <Numeral
            className="rounded-full bg-lime px-4 py-1.5 whitespace-nowrap text-ink"
            size="sm"
          >
            {product.price} Kč
          </Numeral>
        </div>
        <div className="mt-3">
          {product.available ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-club-dark [&_svg]:size-4">
              <CircleCheck strokeWidth={2.5} /> V nabídce
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-faint [&_svg]:size-4">
              <CircleX strokeWidth={2.5} /> Momentálně mimo nabídku
            </span>
          )}
        </div>
      </div>

      {product.description && (
        <p className="leading-relaxed text-pretty text-dim">{product.description}</p>
      )}

      {(product.sizes ?? []).length > 0 && (
        <div>
          <CardTitle className="mb-3" size="xs">
            Velikosti
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {(product.sizes ?? []).map((size) => (
              <span
                className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold"
                key={size.id}
              >
                {size.label}
                {size.note && <span className="font-medium text-faint"> · {size.note}</span>}
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
          <p className="mt-2 text-center text-xs font-medium text-faint">
            {product.orderNote ?? 'V objednávce uveďte název předmětu, velikost a počet kusů.'}
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
                className="flex items-center justify-between gap-6 border-b border-line-soft py-3 last:border-b-0"
                key={param.id}
              >
                <dt className="text-sm font-medium text-faint">{param.label}</dt>
                <dd className="text-right text-sm font-semibold">{param.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
