import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Uppercase mikro-label (eyebrow) — „PARTNEŘI KLUBU", „SEZÓNA 2025/26",
 * datumy nad nadpisy karet. Jediný zdroj velikosti i trackingu; dřív se
 * psal ručně s pěti různými hodnotami `tracking-[...]`.
 */
const eyebrowVariants = cva('text-eyebrow font-extrabold tracking-[0.16em] uppercase', {
  variants: {
    tone: {
      lime: 'text-lime',
      club: 'text-club',
      faint: 'text-faint',
      /** Ztišený label na tmavém podkladu (hlavičky tabulek v panelech). */
      dark: 'text-faint-dark',
      white: 'text-white/60',
      /**
       * Nadpis sloupce na klubové zelené (patička). `white` tam nestačí:
       * `text-white/60` na `bg-club` (#17703a) dává ~3,4:1, což je pod AA
       * i pro 11px uppercase — a jde o nadpis, ne o ztišený doplněk.
       */
      'white-strong': 'text-white/80',
    },
    /** Volnější prostrkání pro samostatně stojící label přes fotku. */
    wide: {
      true: 'tracking-[0.2em]',
      false: '',
    },
    /**
     * Prostrkání z handoffu pro labely uvnitř hustých řádků (fáze zápasu ve
     * výsledcích: `letter-spacing:0.08em`). Výchozích 0.16em je dvojnásobek,
     * takže „ČTVRTFINÁLE" vycházelo o ~15 % širší, než s čím design počítal,
     * a v pevném sloupci přetékalo do názvu zápasu.
     */
    tight: {
      true: 'tracking-[0.08em]',
      false: '',
    },
  },
  defaultVariants: { tone: 'faint', wide: false, tight: false },
})

export type EyebrowProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof eyebrowVariants> & {
    /** Hlavičky tabulek jsou gridové `<div>`y — `<span>` do nich nesmí. */
    as?: 'span' | 'div'
  }

export function Eyebrow({
  children,
  className,
  tone,
  wide,
  tight,
  as = 'span',
  ...props
}: EyebrowProps) {
  const Tag = as
  return (
    <Tag className={cn(eyebrowVariants({ tone, wide, tight }), className)} {...props}>
      {children}
    </Tag>
  )
}

/** Malý orámovaný pill štítek nad nadpisem sekce („Aktuality", „Kontakt"…). */
export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border border-line px-4 py-1.5 text-caption font-semibold text-ink-soft',
        className,
      )}
    >
      {children}
    </span>
  )
}

/**
 * Lime zvýraznění části nadpisu (podpis designu).
 *
 * `dot` přilepí tečku za slovo v klubové zelené — je to součást kompozice,
 * ne interpunkce, proto bez mezery. Psát ji zvlášť za `</Highlight>` jako
 * text vedle sebe dřív nechávalo 8px mezeru z paddingu zvýraznění navíc
 * (`bg-lime slovo. ` čtený jako „slovo .").
 */
export function Highlight({
  children,
  dot = false,
}: {
  children: React.ReactNode
  dot?: boolean
}) {
  return (
    <>
      <span className="bg-lime box-decoration-clone px-2">{children}</span>
      {dot && <span className="text-club">.</span>}
    </>
  )
}
