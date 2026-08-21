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
 * Přešlo se na grid, protože karty jsou teď textové a bez fotek nemají tak
 * rozdílnou výšku — a čtení po řádcích odpovídá řazení podle data.
 */
export function AktualityGrid({
  activeType,
  cards,
  showPhoto = false,
}: {
  /** Zapnutý filtr typu — rozhoduje o znění prázdného stavu. */
  activeType?: string | null
  cards: PostCard[]
  /** `siteConfig.postsListShowPhoto` — náhledové fotky na kartách. */
  showPhoto?: boolean
}) {
  return (
    <CardGrid empty={<AktualityEmpty activeType={activeType ?? null} />} items={cards}>
      {(card) => (
        <ArticleCard
          card={card}
          key={card.id}
          /* Mřížka `CardGrid` je 1 / 2 / 3 sloupce (mobil / tablet / od 1024px) —
             `sizes` musí kopírovat tytéž zlomy, jinak si tablet tahá fotku
             na dvojnásobek šířky karty. */
          sizes="(max-width: 48rem) 100vw, (max-width: 64rem) 50vw, 33vw"
          withPhoto={showPhoto}
        />
      )}
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
