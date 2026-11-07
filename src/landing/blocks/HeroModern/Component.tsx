import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { HERO } from '@/landing/content'
import { MatchStrip } from '@/landing/features/matches/components/MatchStrip'
import { fetchPlayed, fetchUpcoming } from '@/landing/features/matches/data/matches'
import { fetchNavCta, fetchNavigation } from '@/landing/features/navigation/data'
import type { NavCta, NavItem } from '@/landing/features/navigation/types'
import { uploadToPhoto } from '@/landing/lib/media'
import type { HeroModernContent } from '@/landing/types'
import { PageTitle } from '@/landing/ui/Heading'
import { PhotoTile } from '@/landing/ui/PhotoTile'
import type { LandingHeroModernBlock } from '@/payload-types'

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
 * Proti variantě 1 (`blocks/Hero`) je to čistý claim bez karty zápasu na
 * fotce: nižší fotka, logo zavěšené uprostřed horní hrany a text dole vlevo
 * v pořadí headline → perex → CTA (h1 první, aby ho čtenář i čtečka potkali
 * dřív než tlačítka). Aktuální zápasy nese kompaktní `MatchStrip` pod fotkou
 * — handoff kartu na fotce nemá, ale informace o příštím zápase a posledním
 * výsledku musí být na mobilu hned po prvním scrollu.
 */
export async function HeroModernBlockComponent({ block }: { block: LandingHeroModernBlock }) {
  const [navItems, navCta, { upcoming }, { lastResult }] = await Promise.all([
    fetchNavigation(),
    // Vypnuté tlačítko v navigaci nemá cenu dohledávat v Nastavení webu.
    block.showNavCta === false ? null : fetchNavCta(block.navCtaLabel),
    fetchUpcoming(),
    fetchPlayed(),
  ])

  return (
    <>
      <HeroModernView content={mapHero(block)} navCta={navCta} navItems={navItems} />
      <MatchStrip lastResult={lastResult} upcoming={upcoming} />
    </>
  )
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

        <div className="relative z-3 px-4.5 pt-70 pb-5.5 md:absolute md:inset-x-hero-inset md:bottom-9 md:p-0">
          <div className="max-w-160">
            {/* dvouřádkový headline: základ regular (PageTitle weight="normal"),
                tučný řádek zvýrazněný uvnitř. Interpunkci z CMS zahazujeme —
                tečku kreslí handoff v lime jako součást kompozice, ne textu.
                Sousedí přímo s textem: JSX by z odřádkování udělalo mezeru,
                proto je výraz i span na jednom řádku. */}
            <PageTitle
              className="text-on-contrast text-shadow-photo"
              size="hero-sm"
              weight="normal"
            >
              <span className="block">{content.headlineLight}</span>
              <span className="block font-bold">
                {content.headlineBold.replace(/\s*[.!]$/, '')}
                <span className="text-lime">.</span>
              </span>
            </PageTitle>
            <p className="mt-4 mb-6 max-w-110 text-lg leading-snug text-pretty text-on-contrast-strong text-shadow-photo">
              {content.intro}
            </p>
            {content.cta && (
              <div className="flex flex-wrap items-center gap-2.5">
                <Button asChild size="lg" variant={content.cta.variant} withArrow>
                  <Link href={content.cta.href}>{content.cta.label}</Link>
                </Button>
                <Button asChild size="lg" variant="glass">
                  <Link href={HERO.joinCta.href}>{HERO.joinCta.label}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </PhotoTile>
    </header>
  )
}
