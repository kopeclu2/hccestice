import type { Metadata } from 'next'

import React from 'react'

import { PageCanvas } from '@/landing/components/PageCanvas'
import { PageTitle, SectionTitle } from '@/landing/components/Heading'
import { Kicker } from '@/landing/components/Kicker'
import { SectionShell } from '@/landing/components/SectionShell'
import {
  PatternBackground,
  type PatternFade,
  type PatternTone,
  type PatternVariant,
} from '@/landing/components/PatternBackground'
import { cn } from '@/utilities/ui'

export const revalidate = 600

/**
 * Galerie vzorů pozadí — interní stránka pro výběr vzoru do sekcí
 * (obdoba shadcnblocks „background pattern" v klubových barvách).
 * Neindexuje se; komponenta: `@/landing/components/PatternBackground`.
 */

const VARIANTS: Array<{ variant: PatternVariant; label: string; note: string; fade: PatternFade }> =
  [
    { variant: 'grid', label: 'Mřížka', note: 'tenké linky 56 px', fade: 'center' },
    { variant: 'grid-dashed', label: 'Čárkovaná mřížka', note: 'SVG dlaždice', fade: 'center' },
    { variant: 'cross', label: 'Diagonální kříž', note: 'linky ±45°', fade: 'center' },
    { variant: 'dots', label: 'Tečky', note: 'jako DotGrid, plošně', fade: 'center' },
    { variant: 'hatch', label: 'Šrafování', note: 'stejné jako utilita hatch', fade: 'center' },
    { variant: 'circuit', label: 'Circuit board', note: 'mřížka + uzly', fade: 'center' },
    { variant: 'glow', label: 'Záře shora', note: 'radiální gradient', fade: 'none' },
    { variant: 'glow-duo', label: 'Dvojitá záře', note: 'zelená + lime v rozích', fade: 'none' },
    { variant: 'noise', label: 'Zrno + záře', note: 'feTurbulence šum', fade: 'none' },
  ]

const FADES: PatternFade[] = [
  'none',
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]

const DARK_DEMOS: Array<{ variant: PatternVariant; tone: PatternTone; fade: PatternFade }> = [
  { variant: 'grid-dashed', tone: 'white', fade: 'center' },
  { variant: 'cross', tone: 'white', fade: 'top' },
  { variant: 'dots', tone: 'lime', fade: 'bottom-right' },
  { variant: 'circuit', tone: 'lime', fade: 'center' },
  { variant: 'glow', tone: 'lime', fade: 'none' },
  { variant: 'noise', tone: 'white', fade: 'none' },
]

export default function PatternGalleryPage() {
  return (
    <PageCanvas hatch={false} surface="paper">
      <header className="mx-auto max-w-[97.5rem] px-[clamp(0.875rem,3vw,2.5rem)] pt-16 text-center">
        <Kicker>Interní náhled</Kicker>
        <PageTitle className="mx-auto mt-5 max-w-200" size="sm">
          Vzory pozadí
        </PageTitle>
        <p className="text-dim mx-auto mt-4 max-w-160 leading-relaxed text-pretty">
          Komponenta{' '}
          <code className="bg-chip rounded px-1.5 font-mono text-meta">PatternBackground</code> —
          vzor se vkládá jako první potomek do sekce s{' '}
          <code className="bg-chip rounded px-1.5 font-mono text-meta">relative</code>, obsah nad
          ním dostane <code className="bg-chip rounded px-1.5 font-mono text-meta">relative</code>.
          Volí se vzor (<code className="bg-chip rounded px-1.5 font-mono text-meta">variant</code>
          ), vytracení (<code className="bg-chip rounded px-1.5 font-mono text-meta">fade</code>) a
          barva (<code className="bg-chip rounded px-1.5 font-mono text-meta">tone</code>).
        </p>
      </header>

      {/* ── všechny vzory (klubová zelená na světlé) ── */}
      <Section
        perex={'Výchozí tón „club" na světlé ploše. U mřížek se hodí fade, záře fungují bez masky.'}
        title="Vzory"
      >
        {VARIANTS.map((demo) => (
          <DemoCard
            code={`<PatternBackground variant="${demo.variant}"${demo.fade !== 'none' ? ` fade="${demo.fade}"` : ''} />`}
            key={demo.variant}
            label={demo.label}
            note={demo.note}
          >
            <PatternBackground fade={demo.fade} variant={demo.variant} />
          </DemoCard>
        ))}
      </Section>

      {/* ── fade masky na jednom vzoru ── */}
      <Section perex="Stejný vzor (čárkovaná mřížka), různé směry vytracení." title="Fade masky">
        {FADES.map((fade) => (
          <DemoCard code={`fade="${fade}"`} key={fade} label={fade}>
            <PatternBackground fade={fade} variant="grid-dashed" />
          </DemoCard>
        ))}
      </Section>

      {/* ── tmavé plochy ── */}
      <Section
        perex={'Tóny „white" a „lime" pro tmavé panely (ink karta, zelený panel, patička).'}
        title="Na tmavé ploše"
      >
        {DARK_DEMOS.map((demo) => (
          <DemoCard
            code={`<PatternBackground variant="${demo.variant}" tone="${demo.tone}"${demo.fade !== 'none' ? ` fade="${demo.fade}"` : ''} />`}
            dark
            key={`${demo.variant}-${demo.tone}`}
            label={`${demo.variant} · ${demo.tone}`}
          >
            <PatternBackground fade={demo.fade} tone={demo.tone} variant={demo.variant} />
          </DemoCard>
        ))}
      </Section>
    </PageCanvas>
  )
}

function Section({
  title,
  perex,
  children,
}: {
  title: string
  perex: string
  children: React.ReactNode
}) {
  return (
    <SectionShell spacing="section">
      <div className="border-line border-b pb-5">
        <SectionTitle>{title}</SectionTitle>
        <p className="text-dim mt-2 max-w-180 leading-relaxed text-pretty">{perex}</p>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </SectionShell>
  )
}

/** Karta s živým vzorem, názvem a kódem pro copy-paste. */
function DemoCard({
  label,
  note,
  code,
  dark = false,
  children,
}: {
  label: string
  note?: string
  code: string
  dark?: boolean
  children: React.ReactNode
}) {
  return (
    <figure
      className={cn(
        'relative isolate h-64 overflow-hidden rounded-panel border',
        dark ? 'bg-contrast border-contrast' : 'border-line bg-surface',
      )}
    >
      {children}
      <figcaption className="absolute inset-x-4 bottom-4">
        <div className={cn('text-meta font-extrabold', dark ? 'text-white' : 'text-ink')}>
          {label}
          {note && (
            <span className={cn('ml-2 font-semibold', dark ? 'text-white/55' : 'text-faint')}>
              {note}
            </span>
          )}
        </div>
        <code
          className={cn(
            'mt-1.5 inline-block max-w-full overflow-x-auto rounded-lg px-2.5 py-1 font-mono text-eyebrow whitespace-nowrap',
            dark ? 'bg-white/10 text-lime' : 'bg-chip text-club',
          )}
        >
          {code}
        </code>
      </figcaption>
    </figure>
  )
}

export const metadata: Metadata = {
  title: 'Vzory pozadí — interní galerie | HC Čestice',
  description: 'Interní přehled vzorů pozadí (PatternBackground) pro sekce webu HC Čestice.',
  robots: { index: false, follow: false },
}
