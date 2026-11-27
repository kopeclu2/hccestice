import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { HERO } from '@/landing/content'
import { fetchNavCta, fetchNavigation } from '@/landing/features/navigation/data'
import { SiteNav } from '@/landing/layout/SiteNav'
import { uploadToPhoto } from '@/landing/lib/media'
import type { HeroModernContent } from '@/landing/types'
import { PageTitle } from '@/landing/ui/Heading'
import { PhotoTile } from '@/landing/ui/PhotoTile'
import type { LandingHeroModernBlock } from '@/payload-types'

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
 * fotce: nižší fotka a text dole vlevo v pořadí headline → perex → CTA (h1 první, aby ho čtenář i čtečka potkali
 * dřív než tlačítka). Navigace je bílá karta (`SiteNav`) nad fotkou, ne přes ni.
 */
export async function HeroModernBlockComponent({ block }: { block: LandingHeroModernBlock }) {
  const [navItems, navCta] = await Promise.all([
    fetchNavigation(),
    // Vypnuté tlačítko v navigaci nemá cenu dohledávat v Nastavení webu.
    block.showNavCta === false ? null : fetchNavCta(block.navCtaLabel),
  ])

  return (
    <>
      <SiteNav cta={navCta} items={navItems} />
      <HeroModernView content={mapHero(block)} />
    </>
  )
}

function HeroModernView({ content }: { content: HeroModernContent }) {
  return (
    <header className="relative z-1" id="home">
      <PhotoTile
        className="h-auto min-h-0 rounded-section md:h-[min(64vh,37.5rem)] md:min-h-125"
        gradient="tint"
        photo={content.photo}
        priority
        sizes="100vw"
      >
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
            {content.cta && (
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <Button asChild size="lg" variant={content.cta.variant} withArrow>
                  <Link href={content.cta.href}>{content.cta.label}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </PhotoTile>
    </header>
  )
}
