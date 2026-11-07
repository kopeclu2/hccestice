import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import React from 'react'

import { PeriodRule } from '@/landing/ui/PeriodRule'
import { cn } from '@/lib/utils'

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
 *
 * `scroll-mt-20` (80px) je vyšší, než by sám o sobě potřeboval — pokrývá
 * výšku `GlobalNav` (fixní lišta v root layoutu). Bez ní by kotva po kliku
 * z lišty přistála pod ní zakrytá.
 */
const sectionShellVariants = cva('relative z-1 mx-auto w-full max-w-page scroll-mt-20 px-gutter', {
  variants: {
    spacing: {
      /** Sekce home page — 56px mobil, 80px tablet, 120px desktop (dřív 72 / 112 / 160: prázdno mezi sekcemi bylo delší než jejich obsah). */
      landing: 'mt-14 md:mt-20 lg:mt-30',
      /** Lišta hned pod herem (oznámení) — drží se nahoře. */
      bar: 'mt-8 md:mt-10',
      /**
       * Hlavička podstránky (drobečky) pod navigací — 24px mobil, 40px
       * tablet, 56px desktop. Plochých 56px nechávalo na mobilu pod lištou
       * prázdný pruh vyšší než samotná navigace.
       */
      header: 'mt-6 md:mt-10 lg:mt-14',
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
})

export type SectionShellProps = React.ComponentProps<'section'> &
  VariantProps<typeof sectionShellVariants> & {
    /**
     * Zápisová čára (`PeriodRule`: třetiny I · II · III) uprostřed mezery nad sekcí.
     * Polohy jsou poloviny `landing` odsazení (28 / 40 / 60 px), proto má
     * smysl jen s `spacing="landing"`.
     */
    rink?: boolean
  }

export function SectionShell({ children, className, spacing, rink, ...props }: SectionShellProps) {
  return (
    <section className={cn(sectionShellVariants({ spacing }), className)} {...props}>
      {rink && (
        <PeriodRule className="absolute inset-x-gutter -top-7 -translate-y-1/2 md:-top-10 lg:-top-15" />
      )}
      {children}
    </section>
  )
}
