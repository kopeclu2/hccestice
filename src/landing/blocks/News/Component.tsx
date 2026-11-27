import React from 'react'

import { ArticleCard } from '@/landing/features/posts/components/ArticleCard'
import { fetchDefaultPostPhoto, fetchLatestPosts } from '@/landing/features/posts/data/posts'
import type { PostCard } from '@/landing/features/posts/types'
import { toPostCard } from '@/landing/features/posts/view/posts'
import type { Photo } from '@/landing/types'
import { SectionTitle } from '@/landing/ui/Heading'
import { Highlight } from '@/landing/ui/Kicker'
import { MoreLink } from '@/landing/ui/MoreLink'
import { Reveal } from '@/landing/ui/Reveal'
import { SectionShell } from '@/landing/ui/SectionShell'
import { routes } from '@/lib/routes'
import { cn } from '@/lib/utils'
import type { LandingNewsBlock, Post } from '@/payload-types'

/**
 * Kolik karet úvodní strana nejvýš ukáže: první řádek mřížky (3 sloupce) tvoří
 * hlavní článek přes 2 sloupce a jedna běžná karta, druhý řádek tři běžné —
 * dohromady 5. Další články jsou na `/aktuality` („Všechny aktuality"); `count`
 * z bloku to může jen snížit.
 */
const HOME_CARDS = 5

/** Počet karet zaokrouhlený na plné řádky mřížky (2 nebo 5), ať nezůstane díra. */
function fitToRows(count: number) {
  return count >= HOME_CARDS ? HOME_CARDS : 2
}

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
  return posts
    .slice(0, fitToRows(Math.min(block.count ?? HOME_CARDS, HOME_CARDS)))
    .map((post) => toPostCard(post, defaultPhoto))
}

/** Aktuality: nejnovější publikované posts + volitelný pin z bloku. */
export async function NewsBlockComponent({ block }: { block: LandingNewsBlock }) {
  // Náhled je na kartách vždy; `showPhoto` rozhoduje jen o dosazení výchozího
  // obrázku klubu článkům bez vlastní fotky (jinak dostanou vzorovou plochu).
  const showPhoto = block.showPhoto ?? false
  // +1 navíc: připnutý článek může být starší, než sahá výpis nejnovějších
  const latest = await fetchLatestPosts(HOME_CARDS + 1)
  const defaultPhoto = showPhoto ? await fetchDefaultPostPhoto() : null
  return <NewsView cards={mapNewsCards(block, latest, defaultPhoto)} />
}

/**
 * Aktuality — stejná karta jako výpis `/aktuality` (`PostsListGrid`): hlavní
 * karta od `lg` přes dva ze tří sloupců s fotkou vedle textu a vedle ní jedna
 * běžná karta, dohromady jeden řádek. Sekce nemá štítek nad nadpisem; nadpis
 * a odkaz „Všechny aktuality“ stačí.
 */
function NewsView({ cards }: { cards: PostCard[] }) {
  if (cards.length === 0) return null

  return (
    <SectionShell id="aktuality">
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionTitle>
            Co se v klubu <Highlight>děje</Highlight>
          </SectionTitle>
          <MoreLink href={routes.list.posts}>Všechny aktuality</MoreLink>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const featured = index === 0 && cards.length > 1
          return (
            <Reveal
              className={cn(
                'h-full',
                featured && 'sm:col-span-2 lg:col-span-2',
                // Druhá karta na `sm` zabere celý řádek, ať vedle ní nezůstane
                // prázdná půlka mřížky.
                index === 1 && 'sm:col-span-2 lg:col-span-1',
              )}
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
