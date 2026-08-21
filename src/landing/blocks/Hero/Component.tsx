import type { LandingHeroBlock } from '@/payload-types'

import React from 'react'

import { PageTitle } from '../../components/Heading'
import { Eyebrow } from '../../components/Kicker'
import { PhotoTile } from '../../components/PhotoTile'
import { PillLink } from '../../components/PillLink'
import { HERO } from '../../content'
import { fetchPlayed, fetchUpcoming } from '../../data/matches'
import { uploadToPhoto } from '../../data/format'
import { fetchNavCta, fetchNavigation } from '../../data/navigation'
import type { HeroContent, LastResult, NavCta, NavItem, UpcomingMatch } from '../../types'

import { Countdown } from './Countdown'
import { LandingNav } from './Nav'

/** Block data → view-model (fallbacky na content.ts). */
function mapHero(block: LandingHeroBlock): HeroContent {
  return {
    photo: uploadToPhoto(block.photo),
    intro: block.intro ?? HERO.intro,
    headlineLight: block.headlineLight ?? HERO.headlineLight,
    headlineBold: block.headlineBold ?? HERO.headlineBold,
    ctaLabel: block.ctaLabel ?? HERO.cta.label,
    // navCtaLabel se needituje tady — řeší ho `fetchNavCta` s fallbackem
    // na globální nastavení (blok smí přebít, ale nesmí zastínit CMS).
  }
}

/**
 * Hero — týmová fotka přes celou šířku v zaoblené kartě, navigace,
 * headline s CTA a plovoucí karta zápasu vpravo dole:
 *
 * - je-li naplánovaný další zápas → live countdown do buly,
 * - jinak (mezi sezónami) → poslední výsledek.
 */
export async function HeroBlockComponent({ block }: { block: LandingHeroBlock }) {
  const [{ upcoming }, { lastResult }, navItems, navCta] = await Promise.all([
    fetchUpcoming(),
    fetchPlayed(),
    fetchNavigation(),
    fetchNavCta(block.navCtaLabel),
  ])
  return (
    <HeroView
      content={mapHero(block)}
      lastResult={lastResult}
      navCta={navCta}
      navItems={navItems}
      upcoming={upcoming}
    />
  )
}

function HeroView({
  content,
  upcoming,
  lastResult,
  navItems,
  navCta,
}: {
  content: HeroContent
  upcoming: UpcomingMatch | null
  lastResult: LastResult | null
  navItems: NavItem[]
  navCta: NavCta
}) {
  return (
    <header className="relative z-1" id="home">
      <PhotoTile
        className="h-auto min-h-0 rounded-section md:h-[min(78vh,51.25rem)] md:min-h-160"
        gradient="full"
        photo={content.photo}
        priority
        sizes="100vw"
      >
        <LandingNav cta={navCta} items={navItems} />

        <div className="relative z-3 flex flex-wrap items-end justify-between gap-7 px-4.5 pt-75 pb-5.5 md:absolute md:inset-x-[clamp(1.125rem,3vw,3rem)] md:bottom-10 md:p-0">
          {/* Headline + CTA */}
          <div className="min-w-70 flex-[1_1_26.25rem]">
            <p className="mb-5.5 max-w-110 text-lead leading-snug text-pretty text-white/92">
              {content.intro}
            </p>
            <PillLink className="mb-6.5" href="#sezona" size="lg" variant="dark" withArrow>
              {content.ctaLabel}
            </PillLink>
            {/* dvouřádkový headline s odlišnou vahou řádků — základ regular
                (PageTitle weight="normal"), tučný řádek zvýrazněný uvnitř */}
            <PageTitle className="text-white" size="hero" weight="normal">
              <span className="block">{content.headlineLight}</span>
              <span className="block font-extrabold">{content.headlineBold}</span>
            </PageTitle>
          </div>

          {/* Karta zápasu */}
          <div className="z-3 flex min-w-75 flex-[0_1_26.25rem] flex-col items-start gap-1.5 text-left md:items-end md:text-right">
            {upcoming ? (
              <>
                <MatchLabel label={`Nejbližší zápas · ${upcoming.label}`} />
                <div className="text-[clamp(1.25rem,1.8vw,1.625rem)] leading-tight font-extrabold tracking-tight text-white">
                  {upcoming.title}
                </div>
                <div className="text-meta text-white/65">{upcoming.subtitle}</div>
                <Countdown targetISO={upcoming.kickoffISO} />
              </>
            ) : (
              lastResult && (
                <>
                  <MatchLabel label={`Poslední výsledek · ${lastResult.dateLabel}`} />
                  <div className="text-[clamp(1.25rem,1.8vw,1.625rem)] leading-tight font-extrabold tracking-tight text-white">
                    {lastResult.title}
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-2 md:justify-end">
                    <span className="text-lime text-[clamp(1.875rem,2.6vw,2.625rem)] font-extrabold tracking-tight tabular-nums">
                      {lastResult.score}
                      {lastResult.suffix && ` ${lastResult.suffix}`}
                    </span>
                    <span className="text-caption font-semibold text-white/55">
                      {lastResult.won ? 'výhra' : 'konečný stav'}
                    </span>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </PhotoTile>
    </header>
  )
}

/** Lime „live" tečka + uppercase štítek karty zápasu. */
function MatchLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-lime shadow-ring-lime size-2 rounded-full" />
      <Eyebrow tone="lime">{label}</Eyebrow>
    </div>
  )
}
