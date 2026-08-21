import type { LandingNewsBlock, Post } from '@/payload-types'

import React from 'react'

import { cn } from '@/utilities/ui'

import { ArcLines, GlowCircle, HockeyStick } from '../../components/Decorations'
import { ArticleCard } from '../../components/ArticleCard'
import { SectionTitle } from '../../components/Heading'
import { Highlight, Kicker } from '../../components/Kicker'
import { PillLink } from '../../components/PillLink'
import { Reveal } from '../../components/Reveal'
import { SectionShell } from '../../components/SectionShell'
import { fetchDefaultPostPhoto, fetchLatestPosts, toPostCard } from '../../data/posts'
import type { Photo, PostCard } from '../../types'

/** Kolik karet sekce ukáže, když blok počet nemá. */
const DEFAULT_COUNT = 4

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
  const showPhoto = block.showPhoto ?? false
  // +1 navíc: připnutý článek může být starší, než sahá výpis nejnovějších
  const latest = await fetchLatestPosts((block.count ?? DEFAULT_COUNT) + 1)
  const defaultPhoto = showPhoto ? await fetchDefaultPostPhoto() : null
  return <NewsView cards={mapNewsCards(block, latest, defaultPhoto)} showPhoto={showPhoto} />
}

/**
 * Aktuality — mřížka textových karet ve stejném designu jako výpis
 * `/aktuality` (`ArticleCard`), zakončená CTA na plný výpis.
 *
 * Čtyři karty se na širokém plátně rozloží do čtyř sloupců, tři do tří —
 * jinak by poslední karta zůstala v řádku sama.
 */
function NewsView({ cards, showPhoto = false }: { cards: PostCard[]; showPhoto?: boolean }) {
  if (cards.length === 0) return null

  return (
    <SectionShell id="aktuality">
      <HockeyStick className="right-8 -bottom-38 rotate-18" />
      <GlowCircle className="-left-65 -top-15 size-175" tone="club" />
      <ArcLines className="-right-5 -top-2.5" />
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

      <div
        className={cn(
          'grid grid-cols-1 gap-5',
          cards.length > 3 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3',
        )}
      >
        {cards.map((card, index) => (
          <Reveal className="h-full" delay={index * 0.08} key={card.id}>
            <ArticleCard
              card={card}
              sizes={
                cards.length > 3
                  ? '(max-width: 48rem) 100vw, (max-width: 80rem) 50vw, 25vw'
                  : '(max-width: 48rem) 100vw, 33vw'
              }
              withPhoto={showPhoto}
            />
          </Reveal>
        ))}
      </div>
    </SectionShell>
  )
}
