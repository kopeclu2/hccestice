import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { HERO } from '@/landing/content'
import { Countdown } from '@/landing/features/matches/components/Countdown'
import { fetchPlayed, fetchUpcoming } from '@/landing/features/matches/data/matches'
import type { LastResult, UpcomingMatch } from '@/landing/features/matches/types'
import { fetchNavCta, fetchNavigation } from '@/landing/features/navigation/data'
import type { NavCta, NavItem } from '@/landing/features/navigation/types'
import { uploadToPhoto } from '@/landing/lib/media'
import type { HeroContent } from '@/landing/types'
import { PageTitle } from '@/landing/ui/Heading'
import { Eyebrow } from '@/landing/ui/Kicker'
import { PhotoTile } from '@/landing/ui/PhotoTile'
import type { LandingHeroBlock } from '@/payload-types'

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

        <div className="relative z-3 flex flex-wrap items-end justify-between gap-7 px-4.5 pt-75 pb-5.5 md:absolute md:inset-x-hero-inset md:bottom-10 md:p-0">
          {/* Headline + CTA — claim první, ať ho návštěvník přečte dřív, než
              scrollne (dřív viselo CTA přes tváře hráčů a claim byl až dole
              u hrany fotky). */}
          <div className="min-w-70 flex-[1_1_26.25rem]">
            {/* dvouřádkový headline s odlišnou vahou řádků — základ regular
                (PageTitle weight="normal"), tučný řádek zvýrazněný uvnitř */}
            <PageTitle className="text-on-contrast" size="hero" weight="normal">
              <span className="block">{content.headlineLight}</span>
              <span className="block font-bold">{content.headlineBold}</span>
            </PageTitle>
            <p className="mt-4 mb-6.5 max-w-110 text-lg leading-snug text-pretty text-on-contrast-strong">
              {content.intro}
            </p>
            <Button asChild size="lg" variant="dark" withArrow>
              <Link href="#sezona">{content.ctaLabel}</Link>
            </Button>
          </div>

          {/* Karta zápasu */}
          <div className="z-3 flex min-w-75 flex-[0_1_26.25rem] flex-col items-start gap-1.5 text-left md:items-end md:text-right">
            {upcoming ? (
              <>
                <MatchLabel label={`Nejbližší zápas · ${upcoming.label}`} />
                <div className="text-hero-meta leading-tight font-extrabold tracking-tight text-on-contrast">
                  <HeroMatchLink href={upcoming.href}>{upcoming.title}</HeroMatchLink>
                </div>
                <div className="text-sm text-on-contrast-muted">{upcoming.subtitle}</div>
                <Countdown targetISO={upcoming.kickoffISO} />
              </>
            ) : (
              lastResult && (
                <>
                  <MatchLabel label={`Poslední výsledek · ${lastResult.dateLabel}`} />
                  <div className="text-hero-meta leading-tight font-extrabold tracking-tight text-on-contrast">
                    <HeroMatchLink href={lastResult.href}>{lastResult.title}</HeroMatchLink>
                  </div>
                  <div className="mt-2.5 flex items-baseline gap-2 md:justify-end">
                    <span className="text-hero-value font-extrabold tracking-tight text-lime tabular-nums">
                      {lastResult.score}
                      {lastResult.suffix && ` ${lastResult.suffix}`}
                    </span>
                    <span className="text-xs font-medium text-on-contrast-subtle">
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

/**
 * Název zápasu v hero kartě jako odkaz na detail. Karta leží přímo na fotce
 * bez vlastního pozadí, takže se nestretchuje přes celou plochu (klikala by
 * se fotka kolem) — odkaz je jen titulek, s podtržením na hover a focus.
 * Bez `href` zůstane prostý text.
 */
function HeroMatchLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <>{children}</>
  return (
    <Link
      className="decoration-lime underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
      href={href}
    >
      {children}
    </Link>
  )
}

/** Lime „live" tečka + uppercase štítek karty zápasu. */
function MatchLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="size-2 rounded-full bg-lime shadow-ring-lime" />
      <Eyebrow tone="lime">{label}</Eyebrow>
    </div>
  )
}
