import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/utilities/ui'

import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { PageTitle } from './Heading'
import { SectionShell, type SectionShellProps } from './SectionShell'
import { Watermark } from './Watermark'

/**
 * Perex hlavičky. Šířka se v handoffu liší podle délky textu, proto varianta
 * místo `max-w-*` v každé hlavičce zvlášť.
 */
const perexVariants = cva('text-ink-soft mt-4.5 text-lead leading-[1.55] text-pretty', {
  variants: {
    width: { sm: 'max-w-140', md: 'max-w-150', lg: 'max-w-155' },
  },
  defaultVariants: { width: 'sm' },
})

/** Výchozí umístění obrysového watermarku v pravém horním rohu hlavičky. */
const WATERMARK_CLASS = 'text-club/10 -top-15 -right-7.5 text-watermark-xl'

export type PageHeaderProps = {
  /** Titulek. `Highlight` část se předává jako JSX — každá stránka ji má jinde. */
  title: React.ReactNode
  /** Cesta BEZ „Domů" — to doplní `Breadcrumbs` samo. */
  trail: Crumb[]
  /** Dekorační obrysové slovo v pravém horním rohu („NEWS", „FOTO", „VČHL"…). */
  watermark?: React.ReactNode
  /** Override umístění/velikosti watermarku (historie má větší stupeň a jiný tracking). */
  watermarkClassName?: string
  perex?: React.ReactNode
  perexWidth?: VariantProps<typeof perexVariants>['width']
  /** Titulek detailu je menší než titulek výpisu. */
  titleSize?: 'lg' | 'md'
  titleClassName?: string
  /** Levá část řádku pod perexem: filtry, kotvicí pilulky, CTA. */
  filters?: React.ReactNode
  /** Pravá část řádku (počet, odkaz na tabulky) — vykreslí se za spacerem. */
  meta?: React.ReactNode
  /**
   * Třídy obalu `meta`. Default je ztišený text jen na desktopu; sponzoři ho
   * ukazují i na mobilu a zápasy tam mají `PillLink`, který si styl nese sám —
   * proto se override nepřičítá k defaultu, ale nahrazuje ho.
   */
  metaClassName?: string
  /** `flex-1` spacer mezi filtry a meta. Bez něj obojí sedí vedle sebe vlevo. */
  spacer?: boolean
  /** Override odsazení a rozestupů řádku. */
  rowClassName?: string
  /** Volný obsah pod řádkem (statistické karty historie). */
  children?: React.ReactNode
} & Pick<SectionShellProps, 'className' | 'id' | 'spacing'>

/**
 * Hlavička podstránky: watermark, drobečky, titulek, perex a řádek filtrů.
 *
 * Sedm podstránek si tuhle strukturu skládalo ručně (424 LOC dohromady) —
 * včetně šesti identických watermark class stringů, sedmi identických
 * drobečkových řádků a šesti perexů, které se lišily jen `max-w`.
 * Skládá se výhradně z existujících primitivů, nezavádí žádnou novou
 * barvu ani velikost.
 */
export function PageHeader({
  children,
  className,
  filters,
  id,
  meta,
  metaClassName = 'text-faint hidden text-meta font-semibold md:block',
  perex,
  perexWidth,
  rowClassName,
  spacer = true,
  spacing = 'header',
  title,
  titleClassName,
  titleSize = 'lg',
  trail,
  watermark,
  watermarkClassName,
}: PageHeaderProps) {
  return (
    <SectionShell className={className} id={id} spacing={spacing}>
      {watermark && (
        <Watermark className={cn(WATERMARK_CLASS, watermarkClassName)}>{watermark}</Watermark>
      )}

      <Breadcrumbs trail={trail} />

      <PageTitle className={titleClassName} size={titleSize}>
        {title}
      </PageTitle>

      {perex && <p className={perexVariants({ width: perexWidth })}>{perex}</p>}

      {(filters || meta) && (
        <div className={cn('mt-8.5 flex flex-wrap items-center gap-2', rowClassName)}>
          {filters}
          {spacer && <div className="flex-1" />}
          {meta && <span className={metaClassName}>{meta}</span>}
        </div>
      )}

      {children}
    </SectionShell>
  )
}
