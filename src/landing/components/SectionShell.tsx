import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Obal sekce landing page: kotva pro navigaci, maximální šířka a svislý rytmus.
 *
 * Odsazení se nepíše v komponentách — vždy se vybere `spacing`. Dřív měla
 * každá podstránka vlastní `mt-*` (od `mt-9` po `mt-24`) a hlavičky si navíc
 * duplikovaly celý container; tahle škála obojí sjednocuje.
 *
 * Škála má **tři stupně, ne dva**: desktopová hodnota z handoffu začíná až na
 * `lg` (1024px), na tabletu (768–1023px) je mezistupeň. Dokud desktopová
 * hodnota naskakovala hned na `md`, měl tablet mezi sekcemi 200px prázdna —
 * rytmus navržený pro 1440px šířku na poloviční ploše.
 */
const sectionShellVariants = cva(
  'relative z-1 mx-auto w-full max-w-[97.5rem] scroll-mt-8 px-[clamp(0.875rem,3vw,2.5rem)]',
  {
    variants: {
      spacing: {
        /** Sekce home page — 84px mobil, 128px tablet, 200px desktop (rytmus handoffu). */
        landing: 'mt-21 md:mt-32 lg:mt-50',
        /** Lišta hned pod herem (oznámení) — drží se nahoře. */
        bar: 'mt-8 md:mt-10',
        /** Hlavička podstránky pod navigací. */
        header: 'mt-14',
        /** První obsahový blok po hlavičce podstránky. */
        content: 'mt-12',
        /** Další sekce podstránky — 72px mobil, 96px tablet, 140px desktop. */
        section: 'mt-18 md:mt-24 lg:mt-35',
        /**
         * Druhá polovina téže sekce (rozpis → výsledky v bloku Sezóna).
         * Menší odstup záměrně drží obě části pohromadě.
         */
        split: 'mt-12 md:mt-15',
        /**
         * CTA pás na konci podstránky, nad patičkou — 72px mobil, 96px tablet,
         * 120px desktop. Jediná hodnota ve škále, která mobilní stupeň neměla:
         * pás se od výpisu odrážel 120px prázdna i na 320px displeji.
         */
        cta: 'mt-18 md:mt-24 lg:mt-30',
        /** Bez odsazení — rytmus řeší vnořené sekce samy. */
        none: '',
      },
    },
    defaultVariants: { spacing: 'landing' },
  },
)

export type SectionShellProps = React.ComponentProps<'section'> &
  VariantProps<typeof sectionShellVariants>

export function SectionShell({ children, className, spacing, ...props }: SectionShellProps) {
  return (
    <section className={cn(sectionShellVariants({ spacing }), className)} {...props}>
      {children}
    </section>
  )
}
