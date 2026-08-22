import React from 'react'

import { ArticleCard } from '../components/ArticleCard'
import { SectionTitle } from '../components/Heading'
import { Highlight, Kicker } from '../components/Kicker'
import { PillLink } from '../components/PillLink'
import { Reveal } from '../components/Reveal'
import { SectionShell } from '../components/SectionShell'
import type { PostCard } from '../types'

/**
 * Sekce „Mohlo by tě zajímat" — tři karty souvisejících článků
 * (ruční výběr v adminu doplněný nejnovějšími, viz `fetchRelatedPostCards`).
 *
 * Karta je `ArticleCard`, tedy tatáž komponenta jako na výpisu `/aktuality`
 * i ve widgetu Aktuality — dřív to byla vlastní fotodlaždice s titulkem
 * v přetisku, takže doporučené články vypadaly jako z jiného webu než ten
 * výpis, na který sekce odkazuje.
 */
export function ArticleRelated({
  cards,
  showPhoto = false,
}: {
  cards: PostCard[]
  /** `siteConfig.postsListShowPhoto` — stejný přepínač jako výpis /aktuality. */
  showPhoto?: boolean
}) {
  if (cards.length === 0) return null

  return (
    <SectionShell spacing="section">
      <Reveal>
        <div className="mb-9 flex flex-wrap items-end gap-4">
          <div>
            <Kicker>Další čtení</Kicker>
            <SectionTitle className="mt-3.5" size="md">
              Mohlo by tě <Highlight>zajímat</Highlight>
            </SectionTitle>
          </div>
          <div className="hidden flex-1 md:block" />
          <PillLink href="/aktuality" size="sm" variant="outline">
            Všechny aktuality ↗
          </PillLink>
        </div>
      </Reveal>

      {/* Mřížka je 1:1 s `CardGrid` na `/aktuality` (1 / 2 od `sm` / 3 od `lg`).
          Dřív se tu třetí dlaždice ve dvou sloupcích rozpínala přes celý řádek —
          to platilo pro fotodlaždice, u textové karty by vznikl přes celou
          šířku roztažený titulek, jaký výpis nikde nemá. */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <Reveal className="h-full" delay={index * 0.08} key={card.id}>
            <ArticleCard
              card={card}
              sizes="(max-width: 48rem) 100vw, (max-width: 64rem) 50vw, 33vw"
              withPhoto={showPhoto}
            />
          </Reveal>
        ))}
      </div>
    </SectionShell>
  )
}
