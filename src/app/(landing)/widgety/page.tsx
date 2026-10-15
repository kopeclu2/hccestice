import { Database, MousePointerClick, Puzzle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { renderLandingBlock } from '@/landing/blocks/render'
import { SubpageShell } from '@/landing/layout/SubpageShell'
import { Badge } from '@/landing/ui/Badge'
import { CardTitle, PageTitle, SectionTitle } from '@/landing/ui/Heading'
import { Eyebrow, Kicker } from '@/landing/ui/Kicker'
import { SectionShell } from '@/landing/ui/SectionShell'
import { buildWidgetCatalog, resolveExampleIds, type WidgetDoc } from '@/landing/widget-catalog'
import { brandTitle } from '@/lib/brandTitle'

export const revalidate = 600

/**
 * Katalog widgetů — interní dokumentační stránka pro správce webu.
 *
 * Pro každý blok: co dělá, odkud bere data, jak ho nastavit v adminu,
 * a pod tím ŽIVÁ ukázka (příklady se plní skutečnými dokumenty z CMS,
 * takže katalog vždy odpovídá realitě). Neindexuje se (robots noindex).
 *
 * Stojí na `SubpageShell` (ne na nahém `PageCanvas`, který si shell skládá
 * sám), takže má navigaci i patičku jako ostatních osm podstránek. Bez nich
 * byla hlavička přilepená pod hranu viewportu a z katalogu nevedla cesta zpět.
 */
export default async function WidgetCatalogPage() {
  const ids = await resolveExampleIds()
  const catalog = buildWidgetCatalog(ids)
  const total = catalog.reduce((sum, category) => sum + category.widgets.length, 0)

  return (
    <SubpageShell hatch={false} surface="paper">
      {/* hlavička katalogu */}
      <header className="mx-auto max-w-page px-gutter pt-16 text-center">
        <Kicker>Příručka pro správce</Kicker>
        <PageTitle className="mx-auto mt-5 max-w-200" size="sm">
          Katalog widgetů
        </PageTitle>
        <p className="mx-auto mt-4 max-w-150 leading-relaxed text-pretty text-dim">
          Všech {total} widgetů, které lze v adminu vložit na stránku (Stránky → Content → Add
          Layout). U každého: co dělá, odkud bere obsah, jak ho nastavit — a živá ukázka.
        </p>
        <p className="mx-auto mt-3 max-w-150 text-sm text-faint">
          Sekce homepage (Hero, Aktuality, Sezóna…) tu nejsou — ty vidíš na{' '}
          <Link className="font-semibold text-club" href="/">
            úvodní stránce
          </Link>
          .
        </p>
      </header>

      {catalog.map((category) => (
        <SectionShell key={category.title} spacing="section">
          <div className="border-b border-line pb-6">
            <SectionTitle>
              {category.title}
              <span className="ml-3 text-lg font-medium text-faint">
                {category.widgets.length}×
              </span>
            </SectionTitle>
            <p className="mt-2 max-w-180 leading-relaxed text-pretty text-dim">{category.perex}</p>
          </div>

          {category.widgets.map((widget) => (
            <WidgetEntry key={widget.blockType} widget={widget} />
          ))}
        </SectionShell>
      ))}
    </SubpageShell>
  )
}

/** Dokumentační karta widgetu + živá ukázka pod ní. */
function WidgetEntry({ widget }: { widget: WidgetDoc }) {
  return (
    <article className="mt-16" id={widget.blockType}>
      {/* Dokumentace. Odsazení má tři stupně: `p-6` bralo na 390px displeji
          48 ze 370px šířky panelu, desktopová hodnota z handoffu patří na `lg`. */}
      <div className="rounded-card bg-contrast p-4.5 text-on-contrast md:p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle size="md">{widget.name}</CardTitle>
          <Badge className="font-mono" size="sm" variant="lime">
            {widget.blockType}
          </Badge>
        </div>
        <p className="mt-2 max-w-200 leading-relaxed text-on-contrast-strong">
          {widget.description}
        </p>
        <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
          <div className="flex gap-3">
            <Database className="mt-0.5 size-4.5 flex-none text-lime" strokeWidth={2.25} />
            <div>
              <dt className="text-eyebrow font-bold tracking-caps-lg text-on-contrast-subtle uppercase">
                Odkud bere obsah
              </dt>
              <dd className="mt-0.5 text-on-contrast-strong">{widget.dataSource}</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <MousePointerClick className="mt-0.5 size-4.5 flex-none text-lime" strokeWidth={2.25} />
            <div>
              <dt className="text-eyebrow font-bold tracking-caps-lg text-on-contrast-subtle uppercase">
                Jak použít v adminu
              </dt>
              <dd className="mt-0.5 text-on-contrast-strong">{widget.usage}</dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Živá ukázka — widget renderuje stejnou komponentou jako na webu.
          `md:[&_section]:mt-8` bylo bajtově totožné s bezpodmínečnou třídou,
          tedy mrtvé; skutečný mezistupeň je rytmus 32 → 40px od `lg`. */}
      <div className="relative mt-4 rounded-card border-2 border-dashed border-line pb-4 [&_section]:mt-8 lg:[&_section]:mt-10">
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
  title: brandTitle('Katalog widgetů — příručka pro správce'),
  description: 'Interní přehled všech bloků a widgetů webu HC Čestice s ukázkami a návodem.',
  robots: { index: false, follow: false },
}
