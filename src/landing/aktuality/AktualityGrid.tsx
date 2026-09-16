import { X } from 'lucide-react'
import React from 'react'

import { ArticleCard } from '../components/ArticleCard'
import { CardGrid } from '../components/CardGrid'
import { EmptyState } from '../components/EmptyState'
import { PillLink } from '../components/PillLink'
import { POST_TYPE_LABEL } from '../data/posts'
import type { PostCard } from '../types'

/**
 * Výpis článků — pravidelná mřížka, na mobilu jeden sloupec.
 *
 * Handoff „HC Cestice Aktuality" měl masonry (CSS columns, řazení po sloupcích).
 * Přešlo se na grid: karty mají jednotný náhled, takže se jejich výška neliší —
 * a čtení po řádcích odpovídá řazení podle data. První karta je featured
 * (od `lg` přes dva sloupce), aby výpis začínal hlavní zprávou, ne mřížkou
 * stejně důležitých dlaždic.
 */
export function AktualityGrid({
  activeType,
  cards,
  featured: featuredPage = true,
}: {
  /** Zapnutý filtr typu — rozhoduje o znění prázdného stavu. */
  activeType?: string | null
  cards: PostCard[]
  /**
   * `false` na druhé a další straně — ta jede v rovné mřížce 3×N beze
   * zvýrazněné první karty. `PostsPage.featured` z `fetchPostsPage` je
   * `true` jen pro `page === 1`, kde je karet 5 (2+1 první řádek, pak
   * trojice); od druhé strany je jich vždy 6 (dva plné řádky).
   */
  featured?: boolean
}) {
  return (
    <CardGrid empty={<AktualityEmpty activeType={activeType ?? null} />} items={cards}>
      {(card, index) => {
        /* Nejnovější článek je „featured": od `sm` přes celý řádek, od `lg`
           přes dva ze tří sloupců a s fotkou vedle textu. */
        const featured = featuredPage && index === 0 && cards.length > 1
        return (
          <ArticleCard
            card={card}
            className={featured ? 'sm:col-span-2 lg:col-span-2' : undefined}
            featured={featured}
            key={card.id}
            /* `sizes` kopíruje zlomy `CardGrid` (1 sloupec / 2 od `sm` = 40rem /
               3 od `lg` = 64rem). Featured karta je od `sm` přes celý řádek
               a její fotka bere od `lg` 55 % ze dvou třetin mřížky ≈ 37vw. */
            sizes={
              featured
                ? '(max-width: 64rem) 100vw, 37vw'
                : '(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw'
            }
          />
        )
      }}
    </CardGrid>
  )
}

/**
 * Prázdný výpis aktualit. Dvě různé situace, které se nesmí slít: filtr bez
 * výsledků (nabídne zrušení filtru — handoff „Tomuhle filtru nic neodpovídá")
 * a prázdná kolekce, kde by odkaz „Zrušit filtr" nikam nevedl.
 */
function AktualityEmpty({ activeType }: { activeType: string | null }) {
  const typeLabel = activeType ? POST_TYPE_LABEL[activeType] : null

  if (!typeLabel) {
    return (
      <EmptyState
        actions={
          <PillLink href="/" size="md" variant="dark" withArrow>
            Zpátky na úvod
          </PillLink>
        }
        icon="search"
        title="Zatím tu žádné články nejsou"
      >
        První aktuality přidáme, jakmile se v klubu něco semele. Mezitím mrkněte na rozpis zápasů.
      </EmptyState>
    )
  }

  return (
    <EmptyState
      actions={
        <>
          <PillLink
            arrowIcon={<X strokeWidth={2.5} />}
            href="/aktuality#seznam"
            size="md"
            variant="dark"
            withArrow
          >
            Zrušit filtr
          </PillLink>
          <PillLink href="/zapasy" size="md" variant="outline">
            Zápasy
          </PillLink>
        </>
      }
      icon="search"
      title="Tomuhle filtru nic neodpovídá"
    >
      V kategorii <strong className="font-bold">{typeLabel}</strong> zatím nejsou žádné články.
      Zkuste jinou kategorii nebo zrušte filtr.
    </EmptyState>
  )
}
