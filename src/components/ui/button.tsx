import { Slot, Slottable } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { ArrowUpRight } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Výchozí velikost. Musí být jeden zdroj pro `buttonVariants` i
 * `buttonArrowVariants` — kdyby měl každý vlastní default, tlačítko bez
 * explicitního `size` by dostalo kruh z jiné velikosti, než má samo.
 */
const DEFAULT_SIZE = 'md' as const

/**
 * Jediný systém tlačítek a CTA pilulek webu (dřív `landing/ui/pill.ts` vedle
 * shadcn Buttonu). Použití:
 *
 * - tlačítko: `<Button variant="outline" size="sm">`
 * - odkaz: `<Button asChild><Link href="…">Text</Link></Button>` — Radix `Slot`
 *   přenese třídy na `<a>`, takže odkaz i tlačítko jsou pixelově identické
 * - jen třídy (`<span>` uvnitř jiného odkazu, stránkování): `buttonVariants()`
 *
 * Varianty odpovídají handoffu:
 * - `dark`    — tmavý button, hover do klubové zelené (hlavní CTA)
 * - `glass`   — skleněná pilulka přes fotku (hero navigace)
 * - `light`   — bílý button (na zelených plochách), hover do lime
 * - `outline` — obrys na světlém pozadí, hover do ink
 * - `inverse` — protipól `outline` pro tmavé plochy (footer, CTA panely přes fotku)
 * - `club`    — obrys v klubové zelené, hover do plné zelené (sekundární filtr)
 * - `lime`    — lime button (odeslání formuláře), hover do bílé
 *
 * `secondary`, `ghost`, `link` a `destructive` jsou standardní shadcn varianty
 * (na tokenech `--secondary`, `--accent`…), které čekají komponenty přidané
 * přes `shadcn add`. Mají `rounded-md`, který v `cn()` přebije `rounded-full`
 * ze základu.
 *
 * `withArrow` přidá kruhovou šipku ↗ (lime na tmavém, ink na lime).
 */
export const buttonVariants = cva(
  'inline-flex cursor-pointer items-center gap-3 rounded-full font-bold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        dark: 'bg-contrast text-on-contrast hover:bg-club',
        glass:
          'border border-on-contrast-line bg-on-contrast-glass font-semibold text-on-contrast backdrop-blur-lg hover:bg-on-contrast-line',
        light: 'bg-surface text-ink hover:bg-lime',
        outline: 'border border-line text-ink hover:bg-contrast hover:text-on-contrast',
        inverse: 'border border-on-contrast-ghost text-on-contrast hover:bg-on-contrast-glass',
        club: 'border border-club text-club hover:bg-club hover:text-on-contrast',
        lime: 'bg-lime text-ink hover:bg-surface',
        secondary: 'rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'rounded-md hover:bg-accent hover:text-accent-foreground',
        link: 'rounded-none text-primary underline-offset-4 hover:underline',
        destructive:
          'rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      /**
       * Výška je fixní (`h-*`), ne odvozená z paddingu. Kruhová šipka je vyšší
       * než textový řádek, takže by u `py-*` určovala výšku tlačítka místo
       * paddingu — stejná velikost by pak byla s šipkou o 6 px vyšší než bez ní
       * a border by přidal další 2 px. S `h-*` (a border-box) je výška
       * deterministická: jedna velikost = jedna výška, vždy.
       *
       * Velikosti pod 44 px se na dotykových šířkách (do `md`) zvedají na
       * 44 px. Na `sm` jedou **všechny** filtry a kotvicí pilulky podstránek,
       * takže malý tap target se netýkal jedné stránky, ale celého webu;
       * `circle` je stránkování. Dorovnání patří sem, do jednoho zdroje —
       * jinak se po hlavičkách rozeseje `max-md:h-11` a na `SeasonFilters`,
       * která `className` nebere, se to musí obcházet obalem s
       * `display: contents`.
       */
      size: {
        /** Bez vlastní velikosti — pro `link`, který sedí v textu. */
        clear: '',
        /** Kompaktní pilulka do hustých výpisů — 36px. */
        xs: 'h-9 gap-2 px-3.5 text-sm [&_svg]:size-3.5',
        /** Navigace, filtry, proklik na plnou stránku — 44px mobil, 40px desktop. */
        sm: 'h-11 px-4 text-sm md:h-10 xl:px-3.5 [&_svg]:size-3.5',
        /** CTA sekcí — 44px. */
        md: 'h-11 px-6 text-sm [&_svg]:size-3.5',
        /** Hlavní CTA (hero, odeslání formuláře) — 50px. */
        lg: 'h-12.5 px-7 text-sm [&_svg]:size-4',
        /**
         * Kruh s fixním průměrem — čísla ve stránkování, šipky railu.
         * Bez vodorovného paddingu, obsah se centruje. 44px mobil, 40px desktop.
         */
        circle: 'grid size-11 place-items-center gap-0 p-0 md:size-10 [&_svg]:size-4',
      },
      /** S šipkou se pravý padding zmenšuje, aby kruh lícoval s okrajem. */
      withArrow: {
        true: '',
        false: '',
      },
      /**
       * Aktivní stav filtru (sezóny, typy článků). Platí jen pro `outline`
       * a `club` — u plných variant nemá co přebít.
       */
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      /* Pravý padding = (výška − průměr kruhu) / 2, aby kruh lícoval s okrajem. */
      { withArrow: true, size: 'xs', className: 'pr-1.75' },
      { withArrow: true, size: 'sm', className: 'pr-2' },
      { withArrow: true, size: 'md', className: 'pr-2.25' },
      { withArrow: true, size: 'lg', className: 'pr-2.75' },
      {
        variant: 'outline',
        selected: true,
        className: 'border-contrast bg-contrast text-on-contrast hover:border-club hover:bg-club',
      },
      {
        variant: 'club',
        selected: true,
        className: 'bg-club text-on-contrast',
      },
    ],
    defaultVariants: {
      variant: 'dark',
      size: DEFAULT_SIZE,
      withArrow: false,
      selected: false,
    },
  },
)

/**
 * Kruhová šipka ↗ uvnitř tlačítka — kontrastní k ploše buttonu.
 *
 * Průměr se škáluje s velikostí tlačítka (jako v handoffu). Jeden fixní průměr
 * pro všechny velikosti byl původní vada: u malých pilulek kruh přerostl
 * textový řádek a začal určovat jejich výšku.
 */
export const buttonArrowVariants = cva(
  'grid flex-none place-items-center rounded-full [&_svg]:size-3.5',
  {
    variants: {
      size: {
        clear: 'size-6',
        xs: 'size-5.5',
        sm: 'size-6',
        md: 'size-6.5',
        lg: 'size-7',
        circle: 'size-6',
      },
      variant: {
        dark: 'bg-lime text-ink',
        glass: 'bg-on-contrast-strong text-ink',
        light: 'bg-lime text-ink',
        outline: 'bg-chip text-ink',
        inverse: 'bg-on-contrast-strong text-ink',
        club: 'bg-chip text-club',
        lime: 'bg-contrast text-lime',
        secondary: 'bg-chip text-ink',
        ghost: 'bg-chip text-ink',
        link: 'bg-chip text-ink',
        destructive: 'bg-on-contrast-strong text-ink',
      },
    },
    defaultVariants: { size: DEFAULT_SIZE, variant: 'dark' },
  },
)

type ButtonArrowProps = VariantProps<typeof buttonArrowVariants> & {
  /** Vlastní ikona místo šipky ↗ (spinner při odesílání, ✕ u zrušení filtru). */
  icon?: React.ReactNode
}

/**
 * Kruh s ikonou pro tlačítko. Samostatně ho potřebuje jen pilulka, která není
 * `<button>` ani odkaz (`<span>` uvnitř jiného odkazu — `PartnerSlotCta`);
 * jinak ho vykreslí `Button` sám přes `withArrow`.
 */
export function ButtonArrow({ icon, size, variant }: ButtonArrowProps) {
  return (
    <span aria-hidden className={buttonArrowVariants({ size, variant })}>
      {icon ?? <ArrowUpRight strokeWidth={2.5} />}
    </span>
  )
}

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /**
     * Vlastní ikona do kruhu místo šipky ↗ — odesílací tlačítko během
     * requestu ukazuje spinner. Vyžaduje `withArrow`, aby kruh vůbec vznikl.
     */
    arrowIcon?: React.ReactNode
  }

/**
 * Bez `'use client'`: komponenta nemá hooky ani události, takže ji server
 * vykreslí rovnou a do klientského bundlu se nedostane, dokud ji neimportuje
 * klientská komponenta. `Slot` z Radixu je v RSC v pořádku.
 *
 * `Slottable` je nutný pro `asChild` + `withArrow`: bez něj by `Slot` čekal
 * jediné dítě a šipku by neměl kam vložit. S ním vloží šipku **dovnitř**
 * předaného elementu (`<a>…text<šipka></a>`).
 */
function Button({
  asChild = false,
  arrowIcon,
  children,
  className,
  selected,
  size,
  type,
  variant,
  withArrow,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, withArrow, selected }), className)}
      // Odkaz (`asChild`) `type` nemá; holý `<button>` je ve formuláři jinak
      // submit, takže tlačítka filtrů by odesílala formulář, který je obaluje.
      type={asChild ? type : (type ?? 'button')}
      {...props}
    >
      <Slottable>{children}</Slottable>
      {withArrow && <ButtonArrow icon={arrowIcon} size={size} variant={variant} />}
    </Comp>
  )
}

export { Button }
