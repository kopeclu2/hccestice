import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/lib/utils'

/**
 * Nadpisy landing page. Jediný zdroj pravdy pro velikost, váhu a tracking —
 * v komponentách se nikdy nepíše `text-[Xrem] font-extrabold tracking-[...]`
 * ručně, vždy se použije jedna z těchhle tří komponent.
 *
 * Škála (mobil → desktop):
 * - `PageTitle`    h1, hero stránky — clamp, 34→72px
 * - `SectionTitle` h2, nadpis sekce — 30→36px (`size="xl"` 30→48px)
 * - `CardTitle`    h3/h4, nadpis karty — 18px / 20px / 24px / 24→30px
 */

/* ── h1 ─────────────────────────────────────────────────────────────────── */

const pageTitleVariants = cva('leading-none tracking-[-0.035em]', {
  variants: {
    /**
     * Hero na home page a `HeroTypo` stojí na normálním řezu s bold
     * zvýrazněním uvnitř (`Highlight`), ostatní nadpisy jsou extrabold.
     */
    weight: {
      normal: 'font-normal',
      extrabold: 'font-extrabold',
    },
    size: {
      /** Hero home page — největší nadpis na webu. */
      hero: 'text-[clamp(2.75rem,5.4vw,5.75rem)] leading-[0.98] tracking-[-0.04em]',
      /** Typografické hero článku — o něco volnější než hero home page. */
      xl: 'text-[clamp(2.5rem,6.2vw,6rem)] leading-[0.98] tracking-[-0.04em]',
      /** Hero podstránky (Zápasy, Aktuality, Historie…). */
      lg: 'text-[clamp(2.375rem,4.6vw,4.5rem)]',
      /**
       * Hero varianta 2 (`blocks/HeroModern`) — claim stojí ve stejném bloku
       * pod CTA a perexem, takže na velikost `hero` nemá nárok: přerostl by
       * je a rozpadl by se na tři řádky.
       */
      'hero-sm': 'text-[clamp(1.875rem,3.4vw,3.375rem)] leading-[1.02] tracking-[-0.035em]',
      /** Nadpis článku / detailu — kratší řádky, těsnější leading. */
      md: 'text-[clamp(2.125rem,4.2vw,4.125rem)] leading-[1.02]',
      /**
       * Systémové stránky (404, 500, údržba) — o stupeň méně než `md`.
       * Nadpis tam stojí pod obřím `ErrorCode`, takže si nemůže brát stejný
       * důraz jako titulek podstránky, jinak si obojí konkuruje.
       */
      system: 'text-[clamp(1.875rem,3.6vw,3.5rem)] leading-[1.02] tracking-[-0.03em]',
      /** Nadpis v úzkém panelu přes fotku. */
      sm: 'text-[clamp(1.625rem,2.6vw,2.5rem)] leading-[1.1] tracking-[-0.03em]',
    },
    balance: {
      balance: 'text-balance',
      pretty: 'text-pretty',
    },
  },
  defaultVariants: { size: 'lg', balance: 'balance', weight: 'extrabold' },
})

export type PageTitleProps = React.ComponentProps<'h1'> & VariantProps<typeof pageTitleVariants>

export function PageTitle({
  children,
  className,
  size,
  balance,
  weight,
  ...props
}: PageTitleProps) {
  return (
    <h1 className={cn(pageTitleVariants({ size, balance, weight }), className)} {...props}>
      {children}
    </h1>
  )
}

/* ── h2 ─────────────────────────────────────────────────────────────────── */

/* Váha patří k velikosti: `md` je v celém handoffu bold, zvýrazněné
 * varianty extrabold. Nesjednocovat — je to záměrný rozdíl v důrazu. */
const sectionTitleVariants = cva('', {
  variants: {
    size: {
      /** Základní nadpis sekce — 30px mobil, 36px desktop. */
      md: 'text-3xl leading-tight font-bold tracking-[-0.025em] md:text-4xl',
      /** Zvýrazněná sekce (CTA banner, hero panel) — 30px → 36px. */
      lg: 'text-3xl leading-tight font-extrabold tracking-[-0.03em] text-pretty md:text-4xl',
      /** Claim ve footeru — největší nadpis mimo hero, 30px → 48px. */
      xl: 'text-3xl leading-tight font-extrabold tracking-[-0.035em] text-pretty md:text-5xl',
    },
  },
  defaultVariants: { size: 'md' },
})

export type SectionTitleProps = React.ComponentProps<'h2'> &
  VariantProps<typeof sectionTitleVariants>

export function SectionTitle({ children, className, size, ...props }: SectionTitleProps) {
  return (
    <h2 className={cn(sectionTitleVariants({ size }), className)} {...props}>
      {children}
    </h2>
  )
}

/* ── h3 / h4 ────────────────────────────────────────────────────────────── */

/* Stejně jako u `SectionTitle`: `md` je bold, ostatní extrabold. */
const cardTitleVariants = cva('', {
  variants: {
    size: {
      /** Nadpis v hustém výpisu (řádek zápasu, milník, mini dlaždice) — 18px. */
      xs: 'text-lg leading-tight font-extrabold',
      /** Nadpis karty v gridu (článek, galerie, trénink) — 20px. */
      sm: 'text-xl leading-[1.15] font-extrabold tracking-[-0.02em] text-pretty',
      /** Základní nadpis karty — 24px. */
      md: 'text-2xl font-bold tracking-[-0.025em]',
      /** Nadpis velkého panelu — 24px mobil, 30px desktop. */
      lg: 'text-2xl font-extrabold tracking-[-0.025em] md:text-3xl',
    },
  },
  defaultVariants: { size: 'md' },
})

export type CardTitleProps = React.ComponentProps<'h3'> &
  VariantProps<typeof cardTitleVariants> & {
    /**
     * Kvůli hierarchii dokumentu jde vyrenderovat jako h4 (karta uvnitř karty)
     * nebo h2 (karta, která je celým obsahem sekce — prázdné stavy) či h1
     * (panel, který je celou hlavičkou stránky — detail zápasu).
     * Velikost a úroveň jsou záměrně nezávislé: první je typografie, druhá
     * struktura dokumentu.
     */
    as?: 'h1' | 'h2' | 'h3' | 'h4'
  }

export function CardTitle({ children, className, size, as = 'h3', ...props }: CardTitleProps) {
  const Tag = as
  return (
    <Tag className={cn(cardTitleVariants({ size }), className)} {...props}>
      {children}
    </Tag>
  )
}
