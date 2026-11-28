import { Facebook, Instagram } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { homeAnchorHref } from '@/landing/features/navigation/navHref'
import type { FooterContent, SiteLinks } from '@/landing/types'
import { SectionTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { Watermark } from '@/landing/ui/Watermark'
import { ARENA_HOME_TEXT, CLUB_LOGO_IMAGE, CLUB_NAME, CLUB_SEAT_TEXT } from '@/lib/club'
import { getMediaUrl } from '@/lib/getMediaUrl'

/**
 * Footer — zelená plocha s fotkou stadionu v overlay, headline
 * „Uvidíme se na zimáku.", CTA + sítě, sloupce odkazů a © řádek.
 */
/**
 * Sociální sítě v patičce: na mobilu jen kulatá ikona (s textem se
 * „Napiš nám" + Facebook + Instagram na 320–390 px nevešly na řádek
 * a pilulky se zalamovaly), od `md` ikona s názvem. Název zůstává
 * v `sr-only`, takže odkaz má přístupné jméno i jako ikona.
 */
const SOCIAL_PILL = 'gap-2 max-md:w-11 max-md:justify-center max-md:px-0 max-md:[&_svg]:size-4.5'

export function LandingFooter({ content, site }: { content: FooterContent; site: SiteLinks }) {
  return (
    /**
     * `mt-18 md:mt-24 lg:mt-30` (rytmus `SectionShell spacing="cta"`), ne
     * `mt-21 md:mt-32 lg:mt-50` (rytmus mezi sekcemi homepage). Patička dřív
     * nesla stejnou hodnotu jako sekce homepage bez ohledu na to, co je nad
     * ní — na podstránkách, které končí zeleným CTA pásem (`CtaStrip`),
     * tak mezi pásem a patičkou (obojí zelené) vznikala 200px prázdná
     * plocha na desktopu. CTA pás už svůj vlastní odstup od PŘEDCHOZÍHO
     * obsahu nese (`spacing="cta"`); patička teď svírá stejný rytmus
     * z druhé strany, takže je pás vizuálně symetricky odsazený z obou stran.
     */
    <footer className="relative z-1 mx-auto mt-18 w-full max-w-page px-gutter pb-12 md:mt-24 lg:mt-30">
      {/*
       * Odsazení má tři stupně, ne dva — stejná logika jako u rytmu sekcí
       * v `SectionShell`. Hodnota z handoffu (44/56px) je kreslená pro
       * 1440px, ale naskakovala už na `md`: na 768px displeji si tak
       * samotné okraje panelu braly 88 z 722 px šířky a 112px svislé
       * výšky, přičemž mezi nimi a claimem „Uvidíme se na zimáku." byl
       * skok z 18px na mobilu bez jakéhokoli mezistupně. Ten je teď
       * 28/32px, desktopová hodnota začíná na `lg`.
       */}
      <div className="relative overflow-hidden rounded-card bg-club px-6 py-9 text-on-contrast md:px-7 md:py-8 lg:px-11 lg:py-14">
        <Watermark className="-right-10 -bottom-15 text-watermark-3xl tracking-display text-on-contrast-wash">
          HCČ
        </Watermark>
        {content.photo && (
          <>
            <Image
              alt=""
              aria-hidden
              className="absolute inset-0 size-full object-cover opacity-12"
              fill
              /* Fotka je jen textura: krytí 12 % pod zeleným scrimem. `100vw`
                 tahalo na telefonu i na desktopu největší variantu pro obraz,
                 ve kterém se detail stejně nepozná. */
              sizes="50vw"
              src={getMediaUrl(content.photo.url, content.photo.updatedAt)}
            />
            {/*
             * Scrim pod obsahem. Fotka stadionu byla `opacity-22` bez něj,
             * takže bílé odkazy sloupců padaly na přeexponované plochy
             * (na mobilu končily „Historie" a „Partneři" na téměř bílém
             * podkladu). Krytí fotky je proto poloviční a zbytek dorovnává
             * přechod ke klubové zelené — nejsilnější dole, kde leží
             * nejvíc textu (sloupce odkazů a © řádek).
             */}
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-club/95 via-club/85 to-club/70"
            />
          </>
        )}

        {/*
         * `minmax(min(20rem,100%),…)`, ne `minmax(20rem,…)`: dolní hranice
         * dráhy 320px byla širší než vnitřek panelu na 320px displeji
         * (256px po odečtení odsazení patičky a paddingu), takže perex i
         * pilulka „Facebook" přetékaly za pravou hranu a `overflow-hidden`
         * je ustřihl. `min()` nechá dráhu spadnout na šířku kontejneru,
         * když se 20rem nevejde — bez breakpointu a na každé šířce.
         */}
        <div className="relative grid grid-cols-[repeat(auto-fit,minmax(min(20rem,100%),1fr))] items-end gap-10 lg:gap-12">
          <div>
            <SectionTitle className="text-on-contrast" size="xl">
              {content.headline}
            </SectionTitle>
            <p className="mt-4 mb-6.5 max-w-115 text-on-contrast">{content.perex}</p>
            {/* Pod 360 px je řádek široký 236 px: „Napiš nám" (141) + dvě ikony
                  (2 × 44) + mezery 2 × 10 se nevejdou, proto užší mezera a levý
                  okraj tlačítka. Ikony zůstávají 44 px (dotykový cíl). */}
            <div className="flex flex-wrap gap-2.5 max-3xs:gap-2">
              <Button asChild className="max-3xs:pl-3.5" variant="light" withArrow>
                <Link href={homeAnchorHref('#kontakt')}>Napiš nám</Link>
              </Button>
              {site.facebook && (
                <Button asChild className={SOCIAL_PILL} size="md" variant="inverse">
                  <Link href={site.facebook} rel="noreferrer" target="_blank">
                    <Facebook aria-hidden />
                    <span className="max-md:sr-only">Facebook</span>
                  </Link>
                </Button>
              )}
              {site.instagram && (
                <Button asChild className={SOCIAL_PILL} size="md" variant="inverse">
                  <Link href={site.instagram} rel="noreferrer" target="_blank">
                    <Instagram aria-hidden />
                    <span className="max-md:sr-only">Instagram</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/*
           * Sloupce odkazů: `gap-1` + `py-3` na odkazu (tap target 44 px na
           * mobilu, na desktopu se padding ruší). Minimum sloupce je `6.5rem`,
           * aby dva sloupce (Klub/Hokej) zůstaly vedle sebe i na 320px displeji.
           */}
          <nav className="grid grid-cols-[repeat(auto-fit,minmax(min(6.5rem,100%),1fr))] gap-x-6 gap-y-8 text-sm max-md:border-t max-md:border-on-contrast-line max-md:pt-9 md:gap-7">
            {content.columns.map((column) => (
              <div className="flex flex-col gap-1 max-md:[&>span]:mb-1" key={column.title}>
                {/* `white-strong` (plná bílá): nadpis sloupce na zelené by jinak byl pod AA. */}
                <Eyebrow tone="white-strong">{column.title}</Eyebrow>
                {column.links.map((link) => (
                  <Link
                    className="py-3 text-on-contrast underline-offset-4 transition-colors hover:underline md:py-0.5"
                    href={homeAnchorHref(link.href)}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/*
         * Rozpěrka `<div className="flex-1" />` tu dřív byla plnohodnotnou
         * položkou zalamovaného flexu, takže na úzkém displeji rozpadl řádek
         * na tři: logo, copyright a liga každé samo na sobě. `justify-between`
         * udělá totéž zarovnání bez fantomové položky a logo s copyrightem
         * drží pohromadě ve vlastním flexu, takže se od sebe neodtrhnou.
         *
         * Plná bílá, ne průhledná: 12px text na `bg-club-dark` (#497d36) má ~4,9:1,
         * 90 % bílá jen ~4,3:1, což je pod AA pro malé písmo. `bg-club` (#5e9e46)
         * dává i s plnou bílou jen 3,3:1, proto je panel na `club-dark`.
         */}
        <div className="relative mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-5 border-t border-on-contrast-line pt-6 text-xs text-on-contrast md:mt-10 lg:mt-11">
          {/* Adresa sídla a stadionu z `lib/club` (táž data jako JSON-LD).
              `basis-full`: vlastní řádek nad copyrightem, ať se dlouhé řádky
              nelámou uprostřed vedle loga. */}
          <address className="flex basis-full flex-wrap gap-x-6 gap-y-2 leading-relaxed not-italic">
            <span>{CLUB_SEAT_TEXT}</span>
            <span>{ARENA_HOME_TEXT}</span>
          </address>
          <span className="flex items-center gap-3.5">
            <Image alt="" aria-hidden height={32} src={CLUB_LOGO_IMAGE} width={32} />
            {`© ${new Date().getFullYear()} ${CLUB_NAME} — TJ Sokol Čestice`}
          </span>

          {/*
           * `data-cc="show-preferencesModal"` je vlastní atribut knihovny
           * `vanilla-cookieconsent` (`CookieConsentInit.tsx`) — na kliknutí
           * reaguje sama, bez `onClick` handleru. Proto `<button>`, ne `Link`:
           * nikam nenaviguje, jen znovu otevře modál s předvolbami.
           *
           * `flex-wrap` tady je nutné, ne kosmetické: bez něj na 320–390px
           * neměly odkazy kam uhnout a zalamoval se text uvnitř nich
           * („Zásady" a „cookies" na dva řádky), místo aby se „Nastavení
           * cookies" a „Východočeská hokejová liga" přesunuly jako celek na
           * další řádek. `py-1` na položkách drží tap target na 44px
           * jako u sloupců odkazů výš (`py-3`, od `sm` zpět na `py-1`).
           */}
          <span className="flex flex-wrap items-center gap-x-5 gap-y-1 sm:gap-x-6">
            <Link
              className="py-3.5 underline-offset-4 transition-colors hover:underline sm:py-1"
              href="/cookies"
            >
              Zásady cookies
            </Link>
            <button
              className="cursor-pointer py-3.5 underline-offset-4 transition-colors hover:underline sm:py-1"
              data-cc="show-preferencesModal"
              type="button"
            >
              Nastavení cookies
            </button>
            <span className="py-1">{content.league}</span>
          </span>
        </div>
      </div>

      {/* Autorský odkaz je záměrně mimo zelený panel — na rozdíl od
          klubových odkazů výš nejde o obsah webu, ale o kredit tvůrce, ať
          se navigace čtečkou u „patičky" nezastaví ještě u tohohle. */}
      <p className="mt-5 text-center text-xs text-faint md:mt-4">
        <Link
          className="inline-flex items-center gap-1.5 py-3.5 transition-colors hover:text-club-dark md:py-1.5"
          href="https://lukaskopecky.cz"
          rel="noopener"
          target="_blank"
        >
          Web vytvořil
          {/* Značka autora (pixelový duch), stejná jako v patičce elselook.cz. */}
          <svg aria-hidden className="size-4 shrink-0" viewBox="0 0 16 16">
            <path
              d="M15,8v1h1v1h-1v1v1v1v1h-1v1h0h-1h-1h-1h-1h-1h-1h-1h-1h-1h-1H2.8H2.4H2.1h0v-1H1v-1v-1v-1v-1H0V9h1V8H0V7h1h0.7v-1v-1h1v-1v-1v-1h1v-1h1v1h1v1h1h1h1h1v-1h1v-1h1v1h1v1v1v1h1v1v1H15h1v1H15z"
              // token-check-ignore: barva značky autora, ne součást designu klubu
              fill="#9F8BE7"
            />
            <path
              d="M9.7,5.9h1v1v1h-1V7V5.9z M5.2,7v1h1V7v-1h-1V7z"
              fill="currentColor"
              className="text-on-contrast"
            />
          </svg>
          <span className="font-medium text-ink-soft">lukaskopecky.cz</span>
          <span className="sr-only"> (otevře se v nové záložce)</span>
        </Link>
      </p>
    </footer>
  )
}
