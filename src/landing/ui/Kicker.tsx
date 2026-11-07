import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/lib/utils'

/**
 * Uppercase mikro-label (eyebrow) — „PARTNEŘI KLUBU", „SEZÓNA 2025/26",
 * datumy nad nadpisy karet. Jediný zdroj velikosti i trackingu; dřív se
 * psal ručně s pěti různými hodnotami `tracking-[...]`.
 */
const eyebrowVariants = cva('text-eyebrow font-bold tracking-caps-lg uppercase', {
  variants: {
    tone: {
      lime: 'text-lime',
      club: 'text-club',
      /** `club` na světlé ploše má jen ~3,3:1; `club-dark` ~5,1:1 (AA pro 11px uppercase). */
      'club-dark': 'text-club-dark',
      faint: 'text-faint',
      /** Ztišený label na tmavém podkladu (hlavičky tabulek v panelech). */
      dark: 'text-faint-dark',
      white: 'text-on-contrast-subtle',
      /**
       * Nadpis sloupce na zelené (patička, `bg-club-dark`). Průhledná bílá tu
       * nestačí: i 80 % dává ~3,8:1, pod AA pro 11px uppercase; plná bílá
       * ~4,9:1.
       */
      'white-strong': 'text-on-contrast',
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
      true: 'tracking-caps-sm',
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
        'inline-block rounded-full border border-line px-4 py-1.5 text-xs font-medium text-ink-soft',
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
export function Highlight({ children, dot = false }: { children: React.ReactNode; dot?: boolean }) {
  return (
    <>
      <span className="bg-lime box-decoration-clone px-2">{children}</span>
      {dot && <span className="text-club">.</span>}
    </>
  )
}
