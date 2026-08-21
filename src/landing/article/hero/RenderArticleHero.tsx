import React from 'react'

import type { ArticleDetail, ArticleHeroVariant } from '../../types'

import { HeroFoto } from './HeroFoto'
import { HeroMatch } from './HeroMatch'
import { HeroPanel } from './HeroPanel'
import { HeroSplit } from './HeroSplit'
import { HeroTypo } from './HeroTypo'

/**
 * Mapa hero variant detailu článku (vzor `src/heros/RenderHero.tsx`).
 * Fallbacky (chybějící fotka/zápas → typografická) řeší `toArticleDetail`,
 * sem už přichází vyřešená varianta.
 */
const heroes: Record<ArticleHeroVariant, React.ComponentType<{ article: ArticleDetail }>> = {
  foto: HeroFoto,
  rozdelene: HeroSplit,
  typograficke: HeroTypo,
  panel: HeroPanel,
  zapas: HeroMatch,
}

export function RenderArticleHero({ article }: { article: ArticleDetail }) {
  const HeroComponent = heroes[article.variant]
  return <HeroComponent article={article} />
}
