import Link from 'next/link'
import React from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { BreadcrumbsJsonLd, type Crumb } from '@/landing/layout/BreadcrumbsJsonLd'
import { cn } from '@/lib/utils'

export type { Crumb }

/**
 * Podklad, na kterém drobečky stojí. `page` jsou hlavičky podstránek
 * (světlé, s odsazením pod sebou); `photo`, `panel` a `light` ladí drobečky
 * v hero článku podle podkladu varianty.
 */
export type BreadcrumbTone = 'page' | 'photo' | 'panel' | 'light'

/**
 * Klikací plocha drobečku 44 px na mobilu (řádek `text-xs` je vysoký 16 px):
 * padding plochu zvětší a stejně velký záporný margin ji vrátí zpět, takže
 * drobečková lišta vypadá a zabírá místo přesně jako dřív. Od `md` (myš) se ruší.
 */
const TAP_AREA = 'max-md:-mx-2 max-md:-my-3.5 max-md:inline-block max-md:px-2 max-md:py-3.5'

const linkClass: Record<BreadcrumbTone, string> = {
  page: 'text-club-dark hover:text-club',
  light: 'text-club-dark hover:text-club',
  photo: 'text-on-contrast-strong hover:text-lime',
  panel: 'text-on-contrast-soft hover:text-lime',
}

const currentClass: Record<BreadcrumbTone, string> = {
  page: 'line-clamp-1 font-semibold text-club-dark',
  light: 'font-semibold text-club-dark',
  photo: 'font-medium text-lime',
  panel: 'font-medium text-lime',
}

const separatorClass: Record<BreadcrumbTone, string> = {
  page: 'opacity-50',
  light: 'text-faint/50',
  photo: 'text-on-contrast-faint',
  panel: 'text-on-contrast-faint',
}

/**
 * Drobečková navigace — sémanticky vždy `nav` + `ol` + `li` (shadcn
 * `Breadcrumb`), vzhled podle `tone`.
 *
 * „Domů" se doplňuje automaticky, volající předává jen zbytek cesty —
 * tím se nedá zapomenout ani napsat jinak. Strukturovaná data
 * (`BreadcrumbList`) vykresluje komponenta sama ze stejného `trail`, takže
 * se viditelné a strojové drobečky nemohou rozejít.
 *
 * Výchozí třídy shadcn primitiv (`text-sm`, `text-muted-foreground`, `gap-2.5`
 * od `sm`, zalamování) se tu přebíjejí, aby drobečky vypadaly jako dřív: jeden
 * řádek, `text-xs`, barva z podkladu (`tone`). Poslední drobek je
 * `BreadcrumbPage` (`aria-current="page"`).
 */
export function Breadcrumbs({
  className,
  tone = 'page',
  trail,
}: {
  className?: string
  tone?: BreadcrumbTone
  trail: Crumb[]
}) {
  const onLight = tone === 'page' || tone === 'light'

  return (
    <Breadcrumb
      aria-label="Drobečková navigace"
      className={cn(tone === 'page' && 'mb-5', className)}
    >
      <BreadcrumbsJsonLd trail={trail} />
      <BreadcrumbList
        className={cn(
          'flex-nowrap gap-2 text-xs font-medium sm:gap-2',
          onLight ? 'text-faint' : 'text-inherit',
        )}
      >
        <BreadcrumbItem className="flex gap-2">
          <BreadcrumbLink asChild className={cn('transition-colors', TAP_AREA, linkClass[tone])}>
            <Link href="/">Domů</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {trail.map((crumb, index) => (
          <React.Fragment key={`${crumb.label}-${index}`}>
            <BreadcrumbSeparator className={separatorClass[tone]}>/</BreadcrumbSeparator>
            <BreadcrumbItem className="flex gap-2">
              {crumb.href ? (
                <BreadcrumbLink
                  asChild
                  className={cn('transition-colors', TAP_AREA, linkClass[tone])}
                >
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className={currentClass[tone]}>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
