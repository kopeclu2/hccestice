import { cva } from 'class-variance-authority'

/**
 * Výchozí velikost pilulky. Musí být jeden zdroj pro `pillVariants`
 * i `arrowVariants` — kdyby měl každý vlastní default, pilulka bez
 * explicitního `size` by dostala kruh z jiné velikosti, než má sama.
 */
const DEFAULT_SIZE = 'md' as const

/**
 * Sdílené varianty pilulkových CTA. Používá `PillLink` (odkaz) i `PillButton`
 * (tlačítko/filtr) — obojí musí být pixelově identické, proto jeden zdroj.
 *
 * Varianty odpovídají handoffu:
 * - `dark`    — tmavý button, hover do klubové zelené (hlavní CTA)
 * - `glass`   — skleněná pilulka přes fotku (hero navigace)
 * - `light`   — bílý button (na zelených plochách), hover do lime
 * - `outline` — obrys na světlém pozadí, hover do ink
 * - `club`    — obrys v klubové zelené, hover do plné zelené (sekundární filtr)
 * - `lime`    — lime button (odeslání formuláře), hover do bílé
 *
 * `withArrow` přidá kruhovou šipku ↗ (lime na tmavém, ink na lime).
 */
export const pillVariants = cva(
  'inline-flex items-center gap-3 whitespace-nowrap rounded-full font-bold transition-colors',
  {
    variants: {
      variant: {
        dark: 'bg-contrast text-on-contrast hover:bg-club',
        glass:
          'border border-white/28 bg-white/16 font-semibold text-white backdrop-blur-lg hover:bg-white/30',
        light: 'bg-surface text-ink hover:bg-lime',
        outline: 'border border-line text-ink hover:bg-contrast hover:text-on-contrast',
        /**
         * Protipól `outline` pro tmavé plochy (footer, CTA panely přes fotku) —
         * bílý obrys, průhledné pozadí, hover do jemné bílé.
         */
        inverse: 'border border-white/40 text-white hover:bg-white/16',
        club: 'border border-club text-club hover:bg-club hover:text-white',
        lime: 'bg-lime text-ink hover:bg-surface',
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
        /** Kompaktní pilulka do hustých výpisů — 36px. */
        xs: 'h-9 gap-2 px-3.5 text-meta [&_svg]:size-3.5',
        /** Navigace, filtry, proklik na plnou stránku — 44px mobil, 40px desktop. */
        sm: 'h-11 px-4.5 text-meta md:h-10 [&_svg]:size-3.5',
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
        className: 'bg-club text-white',
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
 * Kruhová šipka ↗ uvnitř pilulky — kontrastní k ploše buttonu.
 *
 * Průměr se škáluje s velikostí pilulky (jako v handoffu). Jeden fixní průměr
 * pro všechny velikosti byl původní vada: u malých pilulek kruh přerostl
 * textový řádek a začal určovat jejich výšku.
 */
export const arrowVariants = cva(
  'grid flex-none place-items-center rounded-full [&_svg]:size-3.5',
  {
    variants: {
      size: {
        xs: 'size-5.5',
        sm: 'size-6',
        md: 'size-6.5',
        lg: 'size-7',
        circle: 'size-6',
      },
      variant: {
        dark: 'bg-lime text-ink',
        glass: 'bg-white/90 text-ink',
        light: 'bg-lime text-ink',
        outline: 'bg-chip text-ink',
        inverse: 'bg-white/90 text-ink',
        club: 'bg-chip text-club',
        lime: 'bg-contrast text-lime',
      },
    },
    defaultVariants: { size: DEFAULT_SIZE },
  },
)
