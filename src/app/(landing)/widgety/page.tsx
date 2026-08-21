import type { Metadata } from 'next'

import { Database, MousePointerClick, Puzzle } from 'lucide-react'
import React from 'react'

import { PageCanvas } from '@/landing/components/PageCanvas'
import { Badge } from '@/landing/components/Badge'
import { CardTitle, PageTitle, SectionTitle } from '@/landing/components/Heading'
import { Eyebrow, Kicker } from '@/landing/components/Kicker'
import { SectionShell } from '@/landing/components/SectionShell'
import { renderLandingBlock } from '@/landing/render'
import { buildWidgetCatalog, resolveExampleIds, type WidgetDoc } from '@/landing/widget-catalog'

export const revalidate = 600

/**
 * Katalog widgetů — interní dokumentační stránka pro správce webu.
 *
 * Pro každý blok: co dělá, odkud bere data, jak ho nastavit v adminu,
 * a pod tím ŽIVÁ ukázka (příklady se plní skutečnými dokumenty z CMS,
 * takže katalog vždy odpovídá realitě). Neindexuje se (robots noindex).
 */
export default async function WidgetCatalogPage() {
  const ids = await resolveExampleIds()
  const catalog = buildWidgetCatalog(ids)
  const total = catalog.reduce((sum, category) => sum + category.widgets.length, 0)

  return (
    <PageCanvas hatch={false} surface="paper">
      {/* hlavička katalogu */}
      <header className="mx-auto max-w-[97.5rem] px-[clamp(0.875rem,3vw,2.5rem)] pt-16 text-center">
        <Kicker>Příručka pro správce</Kicker>
        <PageTitle className="mx-auto mt-5 max-w-200" size="sm">
          Katalog widgetů
        </PageTitle>
        <p className="text-dim mx-auto mt-4 max-w-150 leading-relaxed text-pretty">
          Všech {total} widgetů, které lze v adminu vložit na stránku (Stránky → Content → Add
          Layout). U každého: co dělá, odkud bere obsah, jak ho nastavit — a živá ukázka.
        </p>
        <p className="text-faint mx-auto mt-3 max-w-150 text-meta">
          Sekce homepage (Hero, Aktuality, Sezóna…) tu nejsou — ty vidíš na{' '}
          <a className="text-club font-bold" href="/">
            úvodní stránce
          </a>
          .
        </p>
      </header>

      {catalog.map((category) => (
        <SectionShell key={category.title} spacing="section">
          <div className="border-line border-b pb-6">
            <SectionTitle>
              {category.title}
              <span className="text-faint ml-3 text-lead font-semibold">
                {category.widgets.length}×
              </span>
            </SectionTitle>
            <p className="text-dim mt-2 max-w-180 leading-relaxed text-pretty">{category.perex}</p>
          </div>

          {category.widgets.map((widget) => (
            <WidgetEntry key={widget.blockType} widget={widget} />
          ))}
        </SectionShell>
      ))}
    </PageCanvas>
  )
}

/** Dokumentační karta widgetu + živá ukázka pod ní. */
function WidgetEntry({ widget }: { widget: WidgetDoc }) {
  return (
    <article className="mt-16" id={widget.blockType}>
      {/* dokumentace */}
      <div className="bg-contrast rounded-card p-6 text-on-contrast md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle size="md">{widget.name}</CardTitle>
          <Badge className="font-mono" size="sm" variant="lime">
            {widget.blockType}
          </Badge>
        </div>
        <p className="mt-2 max-w-200 leading-relaxed text-white/85">{widget.description}</p>
        <dl className="mt-5 grid gap-4 text-meta md:grid-cols-2">
          <div className="flex gap-3">
            <Database className="text-lime mt-0.5 size-4.5 flex-none" strokeWidth={2.25} />
            <div>
              <dt className="text-eyebrow font-extrabold tracking-[0.16em] text-white/60 uppercase">
                Odkud bere obsah
              </dt>
              <dd className="mt-0.5 text-white/85">{widget.dataSource}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <MousePointerClick className="text-lime mt-0.5 size-4.5 flex-none" strokeWidth={2.25} />
            <div>
              <dt className="text-eyebrow font-extrabold tracking-[0.16em] text-white/60 uppercase">
                Jak použít v adminu
              </dt>
              <dd className="mt-0.5 text-white/85">{widget.usage}</dd>
            </div>
          </div>
        </dl>
      </div>

      {/* živá ukázka — widget renderuje stejnou komponentou jako na webu */}
      <div className="border-line relative mt-4 rounded-card border-2 border-dashed pb-4 [&_section]:mt-8 md:[&_section]:mt-8">
        <Eyebrow
          className="absolute -top-2.5 left-8 z-2 inline-flex items-center gap-1.5 bg-paper px-2"
          tone="faint"
        >
          <Puzzle className="size-3.5" strokeWidth={2.5} /> Živá ukázka
        </Eyebrow>
        {renderLandingBlock(widget.example, widget.blockType)}
      </div>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Katalog widgetů — příručka pro správce | HC Čestice',
  description: 'Interní přehled všech bloků a widgetů webu HC Čestice s ukázkami a návodem.',
  robots: { index: false, follow: false },
}
