import type { LandingHeroModernBlock } from '@/payload-types'

import React from 'react'

import { PageTitle } from '../../components/Heading'
import { PhotoTile } from '../../components/PhotoTile'
import { PillLink } from '../../components/PillLink'
import { HERO } from '../../content'
import { uploadToPhoto } from '../../data/format'
import { fetchNavCta, fetchNavigation } from '../../data/navigation'
import type { HeroModernContent, NavCta, NavItem } from '../../types'

import { HeroModernNav } from './Nav'

/** Block data → view-model (fallbacky na content.ts). */
function mapHero(block: LandingHeroModernBlock): HeroModernContent {
  return {
    photo: uploadToPhoto(block.photo),
    intro: block.intro ?? HERO.intro,
    headlineLight: block.headlineLight ?? HERO.headlineLight,
    headlineBold: block.headlineBold ?? HERO.headlineBold,
    // `showCta` má v CMS `defaultValue: true`, ale bloky uložené před
    // přidáním pole mají `null` — proto `!== false`, ne `=== true`.
    cta:
      block.showCta === false
        ? null
        : {
            label: block.ctaLabel ?? HERO.cta.label,
            href: block.ctaHref ?? HERO.cta.href,
            variant: block.ctaVariant ?? 'lime',
          },
  }
}

/**
 * Hero varianta 2 (handoff `design_header/HC Cestice Modern.dc.html`).
 *
 * Proti variantě 1 (`blocks/Hero`) je to čistý claim bez karty zápasu:
 * nižší fotka, logo zavěšené uprostřed horní hrany a text dole vlevo v
 * pořadí CTA → perex → headline. Karta zápasu tu chybí záměrně — handoff ji
 * v této kompozici nemá a na homepage ji pokryje blok „Zápasy" / „Nejbližší
 * zápas". Proto sekce nesahá na `fetchUpcoming`/`fetchPlayed`.
 */
export async function HeroModernBlockComponent({ block }: { block: LandingHeroModernBlock }) {
  const [navItems, navCta] = await Promise.all([
    fetchNavigation(),
    // Vypnuté tlačítko v navigaci nemá cenu dohledávat v Nastavení webu.
    block.showNavCta === false ? null : fetchNavCta(block.navCtaLabel),
  ])

  return <HeroModernView content={mapHero(block)} navCta={navCta} navItems={navItems} />
}

function HeroModernView({
  content,
  navItems,
  navCta,
}: {
  content: HeroModernContent
  navItems: NavItem[]
  navCta: NavCta | null
}) {
  return (
    <header className="relative z-1" id="home">
      <PhotoTile
        className="h-auto min-h-0 rounded-section md:h-[min(64vh,37.5rem)] md:min-h-125"
        gradient="full"
        photo={content.photo}
        priority
        sizes="100vw"
      >
        {/* logo je součástí navigace (prostřední sloupec jejího gridu) */}
        <HeroModernNav cta={navCta} items={navItems} />

        <div className="relative z-3 px-4.5 pt-70 pb-5.5 md:absolute md:inset-x-[clamp(1.125rem,3vw,3rem)] md:bottom-9 md:p-0">
          <div className="max-w-160">
            {content.cta && (
              <PillLink href={content.cta.href} size="lg" variant={content.cta.variant} withArrow>
                {content.cta.label}
              </PillLink>
            )}
            <p className="text-shadow-photo mt-4.5 mb-4 max-w-110 text-lead leading-snug text-pretty text-white/92">
              {content.intro}
            </p>
            {/* dvouřádkový headline: základ regular (PageTitle weight="normal"),
                tučný řádek zvýrazněný uvnitř. Interpunkci z CMS zahazujeme —
                tečku kreslí handoff v lime jako součást kompozice, ne textu.
                Sousedí přímo s textem: JSX by z odřádkování udělalo mezeru,
                proto je výraz i span na jednom řádku. */}
            <PageTitle className="text-shadow-photo text-white" size="hero-sm" weight="normal">
              <span className="block">{content.headlineLight}</span>
              <span className="block font-extrabold">
                {content.headlineBold.replace(/\s*[.!]$/, '')}
                <span className="text-lime">.</span>
              </span>
            </PageTitle>
          </div>
        </div>
      </PhotoTile>
    </header>
  )
}
