import type { Metadata } from 'next'
import React from 'react'

import { PageTitle, SectionTitle } from '@/landing/components/Heading'
import { Kicker } from '@/landing/components/Kicker'
import { SectionShell } from '@/landing/components/SectionShell'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { fetchMatchDetail } from '@/landing/data/matchDetail'
import type { MatchDetail } from '@/landing/types'
import { HeaderApp } from '@/landing/zapas/header-variants/HeaderApp'
import { HeaderArena } from '@/landing/zapas/header-variants/HeaderArena'
import { HeaderEditorial } from '@/landing/zapas/header-variants/HeaderEditorial'
import { HeaderSplit } from '@/landing/zapas/header-variants/HeaderSplit'
import type { HeaderVariantProps } from '@/landing/zapas/header-variants/shared'
import { MatchHeader } from '@/landing/zapas/MatchHeader'

/**
 * Interní náhled variant hlavičky detailu zápasu (`/zapasy/[slug]`).
 * Každá varianta je vykreslená nad stejnými reálnými zápasy z databáze,
 * aby šly porovnat vedle sebe: odehraný po nájezdech, odehraný v normální
 * hrací době, naplánovaný se soupeřem s dlouhým názvem a zátěžový případ
 * soupeře bez znaku (logo je u kopie zápasu uměle odebrané).
 *
 * Kterou variantu dostane detail zápasu, volí správce v Nastavení webu
 * (pole „Vzhled hlavičky detailu zápasu"); „0 — Současná" je původní
 * `MatchHeader` (`classic`). Ten nese vlastní `h1`, takže je v katalogu jediná výjimka
 * z hierarchie nadpisů — jde o interní stránku s `noindex`.
 */
export const revalidate = 600

const SAMPLES: Array<{ slug: string; caption: string; dropOpponentLogo?: boolean }> = [
  { slug: '2026-10-10-hc-policka-b', caption: 'Odehraný · prohra po nájezdech venku' },
  { slug: '2026-02-22-hc-policka-b', caption: 'Odehraný · výhra v normální hrací době doma' },
  { slug: '2026-12-13-sk-divocaci-zamberk', caption: 'Naplánovaný · soupeř s dlouhým názvem' },
  {
    slug: '2026-02-07-hc-aloha-lanskroun',
    caption: 'Zátěžový test · výhra po nájezdech, soupeř bez znaku (logo uměle odebráno)',
    dropOpponentLogo: true,
  },
]

type Variant = {
  id: string
  number: string
  name: string
  summary: string
  render: (props: HeaderVariantProps) => React.ReactNode
}

const VARIANTS: Variant[] = [
  {
    id: 'soucasna',
    number: '0',
    name: 'Současná',
    summary: 'Stávající hlavička z produkce (MatchHeader) — reference pro srovnání.',
    render: ({ match }) => <MatchHeader match={match} />,
  },
  {
    id: 'arena',
    number: 'A',
    name: 'Aréna',
    summary:
      'Televizní světelná tabule: skóre v „LED" polích, třetiny jako mini tabulka se zkratkami týmů, vítěz podsvícený lime.',
    render: (props) => <HeaderArena {...props} />,
  },
  {
    id: 'editorial',
    number: 'B',
    name: 'Editorial',
    summary:
      'Světlá titulní strana sportovní přílohy: obří obrysové číslice skóre, tiráž s datem a soutěží, údaje v jemném řádku.',
    render: (props) => <HeaderEditorial {...props} />,
  },
  {
    id: 'pulene-pole',
    number: 'C',
    name: 'Půlené pole',
    summary:
      'Karta rozdělená šikmým švem na domácí a hosty — vítězná polovina je vyplněná, skóre sedí na švu.',
    render: (props) => <HeaderSplit {...props} />,
  },
  {
    id: 'aplikace',
    number: 'D',
    name: 'Kompaktní aplikace',
    summary:
      'Hustá řádková tabule jako v Livesportu: dva řádky tým · třetiny · celkem, údaje v postranním sloupci, nízká výška.',
    render: (props) => <HeaderApp {...props} />,
  },
]

const loadSamples = async () => {
  const loaded = await Promise.all(
    SAMPLES.map(async (sample) => {
      const match = await fetchMatchDetail(sample.slug).catch(() => null)
      if (!match) return null
      const prepared: MatchDetail = sample.dropOpponentLogo
        ? {
            ...match,
            awayLogo: match.weAreHome ? null : match.awayLogo,
            homeLogo: match.weAreHome ? match.homeLogo : null,
          }
        : match
      return { ...sample, match: prepared }
    }),
  )
  return loaded.filter((item): item is NonNullable<typeof item> => item !== null)
}

export default async function MatchHeaderVariantsPage() {
  const samples = await loadSamples()

  return (
    <SubpageShell hatch={false} surface="paper">
      <header className="mx-auto max-w-[97.5rem] px-[clamp(0.875rem,3vw,2.5rem)] pt-16 text-center">
        <Kicker>Interní náhled</Kicker>
        <PageTitle className="mx-auto mt-5 max-w-200" size="sm">
          Hlavička detailu zápasu
        </PageTitle>
        <p className="mx-auto mt-4 max-w-160 leading-relaxed text-pretty text-dim">
          Čtyři koncepty hlavičky stránky{' '}
          <code className="rounded bg-chip px-1.5 font-mono text-sm">/zapasy/[slug]</code> vedle
          současné podoby. Každý je vykreslený nad stejnými zápasy z databáze — po nájezdech, v
          normální hrací době, naplánovaný a soupeř bez znaku.
        </p>
        <nav aria-label="Varianty" className="mt-6 flex flex-wrap justify-center gap-2">
          {VARIANTS.map((variant) => (
            <a
              className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-ink-soft hover:bg-chip"
              href={`#${variant.id}`}
              key={variant.id}
            >
              {variant.number} — {variant.name}
            </a>
          ))}
        </nav>
      </header>

      {VARIANTS.map((variant) => (
        <SectionShell id={variant.id} key={variant.id} spacing="section">
          <div className="border-b border-line pb-5">
            <SectionTitle>
              <span className="text-club">{variant.number}</span> — {variant.name}
            </SectionTitle>
            <p className="mt-2 max-w-180 leading-relaxed text-pretty text-dim">{variant.summary}</p>
          </div>

          <div className="mt-8 flex flex-col gap-10 md:gap-12">
            {samples.map((sample) => (
              <figure className="m-0" data-variant={variant.id} key={sample.slug}>
                {variant.render({ match: sample.match, titleAs: 'h3' })}
                <figcaption className="mt-3 text-center text-eyebrow font-semibold tracking-[0.1em] text-faint uppercase">
                  {sample.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </SectionShell>
      ))}
    </SubpageShell>
  )
}

export const metadata: Metadata = {
  title: 'Hlavička zápasu — interní náhled | HC Čestice',
  description: 'Interní přehled variant hlavičky detailu zápasu pro web HC Čestice.',
  robots: { index: false, follow: false },
}
