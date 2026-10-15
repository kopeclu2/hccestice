import React from 'react'

import { ArticleCard } from '@/landing/features/posts/components/ArticleCard'
import { fetchDefaultPostPhoto, fetchLatestPosts } from '@/landing/features/posts/data/posts'
import type { PostCard } from '@/landing/features/posts/types'
import { toPostCard } from '@/landing/features/posts/view/posts'
import type { Photo } from '@/landing/types'
import { ArcLines, GlowCircle } from '@/landing/ui/Decorations'
import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight, Kicker } from '@/landing/ui/Kicker'
import { PillLink } from '@/landing/ui/PillLink'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { cn } from '@/lib/utils'
import type { LandingNewsBlock, Post } from '@/payload-types'

/** Kolik karet sekce ukáže, když blok počet nemá. */
const DEFAULT_COUNT = 5

/**
 * Karty sekce: připnutý článek (blok) jako první, zbytek nejnovější
 * publikované. Výchozí obrázek se dosazuje jen se zapnutými fotkami — jinak
 * by karta bez `heroImage` zůstala v mřížce jako jediná bez fotky.
 */
function mapNewsCards(
  block: LandingNewsBlock,
  latest: Post[],
  defaultPhoto: Photo | null,
): PostCard[] {
  const pinned = typeof block.pinnedPost === 'object' ? block.pinnedPost : null
  const posts = pinned ? [pinned, ...latest.filter((post) => post.id !== pinned.id)] : latest
  return posts.slice(0, block.count ?? DEFAULT_COUNT).map((post) => toPostCard(post, defaultPhoto))
}

/** Aktuality: nejnovější publikované posts + volitelný pin z bloku. */
export async function NewsBlockComponent({ block }: { block: LandingNewsBlock }) {
  // Náhled je na kartách vždy; `showPhoto` rozhoduje jen o dosazení výchozího
  // obrázku klubu článkům bez vlastní fotky (jinak dostanou vzorovou plochu).
  const showPhoto = block.showPhoto ?? false
  // +1 navíc: připnutý článek může být starší, než sahá výpis nejnovějších
  const latest = await fetchLatestPosts((block.count ?? DEFAULT_COUNT) + 1)
  const defaultPhoto = showPhoto ? await fetchDefaultPostPhoto() : null
  return <NewsView cards={mapNewsCards(block, latest, defaultPhoto)} />
}

/**
 * Aktuality — stejná mřížka jako výpis `/aktuality` (`PostsListGrid`):
 * featured karta od `lg` přes dva ze tří sloupců, s fotkou vedle textu,
 * vedle ní v prvním řádku ještě jedna běžná karta. Výchozích 5 karet proto
 * vyjde beze zbytku (2 + 1 v prvním řádku, pak trojice) — stejný poměr,
 * jaký `PostsListGrid` používá pro devět.
 */
function NewsView({ cards }: { cards: PostCard[] }) {
  if (cards.length === 0) return null

  return (
    <SectionShell id="aktuality">
      <GlowCircle className="-top-15 -left-65 size-175" tone="club" />
      <ArcLines className="-top-2.5 -right-5" />
      <Reveal>
        <div className="mb-10 flex flex-wrap items-end gap-4">
          <div>
            <Kicker>Aktuality</Kicker>
            <SectionTitle className="mt-3.5">
              Co se v klubu <Highlight>děje</Highlight>
            </SectionTitle>
          </div>
          <div className="flex-1" />
          <PillLink href="/aktuality" size="md" variant="dark" withArrow>
            Všechny aktuality
          </PillLink>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const featured = index === 0 && cards.length > 1
          return (
            <Reveal
              className={cn('h-full', featured && 'sm:col-span-2 lg:col-span-2')}
              delay={index * 0.08}
              key={card.id}
            >
              <ArticleCard
                card={card}
                featured={featured}
                /* `sizes` kopíruje zlomy `CardGrid` (1 sloupec / 2 od `sm` =
                   40rem / 3 od `lg` = 64rem), stejně jako `PostsListGrid`. */
                sizes={
                  featured
                    ? '(max-width: 64rem) 100vw, 37vw'
                    : '(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw'
                }
              />
            </Reveal>
          )
        })}
      </div>
    </SectionShell>
  )
}
