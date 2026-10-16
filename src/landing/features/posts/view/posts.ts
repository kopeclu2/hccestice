import { toScoreboard } from '@/landing/features/matches/view/matchEvents'
import type { PostCard, ArticleAuthor, ArticleDetail } from '@/landing/features/posts/types'
import {
  lexicalPlainText,
  htmlWordCount,
  lexicalWordCount,
  readingLabel,
} from '@/landing/features/posts/view/text'
import { toPhoto, uploadToPhoto } from '@/landing/lib/media'
import type { Photo } from '@/landing/types'
import { CLUB_NAME } from '@/lib/club'
import { formatFullDate, formatLongDate } from '@/lib/datetime'
import { htmlPlainText, snippet, dropTitleEcho, looksLikeProse, echoesTitle } from '@/lib/plainText'
import { linkOrNull, routes } from '@/lib/routes'
import { initials } from '@/lib/teamName'
import type { Post } from '@/payload-types'

/** Články — čisté mapování Payload dokumentu na view-modely (karta, detail). */

/** Štítek karty podle typu článku. */
export const POST_TYPE_LABEL: Record<string, string> = {
  news: 'Novinky',
  report: 'Zápasy',
  roster: 'Soupiska',
  schedule: 'Rozpis',
  standings: 'Výsledky',
}

export const postHref = (post: Post): string | null => linkOrNull(routes.post, post.slug)

export const postTag = (post: Post): string => POST_TYPE_LABEL[post.type ?? 'news'] ?? 'Novinky'

/**
 * Úryvek pro kartu: ruční perex, pak SEO popis, jinak začátek obsahu.
 * Většina naimportovaných článků perex ani popis nemá, takže bez fallbacku
 * z obsahu by textové karty zůstaly jen s titulkem.
 *
 * Fallback z obsahu se bere jen u prózy (novinky, reportáže). Soupisky, rozpisy
 * a tabulky jsou v legacy HTML tabulky, ze kterých vypadne „Obdržených gólů: 0
 * Obdržených gólů: 0…" — tam je lepší nechat kartu bez textu.
 */
export const postSummary = (post: Post, maxChars = 180): string | null => {
  // Perex i SEO popis jsou u naimportovaných článků často celý HTML odstavec
  // (`<p><span style="…">…</span></p>`), takže i ruční hodnota jde přes čištění.
  const manual = htmlPlainText(post.excerpt || post.meta?.description || '')
  if (manual) return snippet(manual, maxChars)
  if (post.type && !['news', 'report'].includes(post.type)) return null

  const text =
    post.contentType === 'html' && post.legacyHtml
      ? htmlPlainText(post.legacyHtml)
      : lexicalPlainText(post.content)
  // Hodnotí se až výsledný úryvek, ne celý článek — próza, která končí
  // tabulkou výsledků, by jinak o úryvek přišla.
  const result = snippet(dropTitleEcho(text, post.title), maxChars)
  if (!looksLikeProse(result)) return null
  // úryvek, který jen zopakuje titulek, na kartě nic nepřidá
  if (echoesTitle(result, post.title)) return null
  return result || null
}

/** Payload dokument → karta článku (bez vlastní fotky výchozí obrázek). */
export const toPostCard = (post: Post, defaultPhoto: Photo | null = null): PostCard => ({
  id: post.id,
  title: post.title,
  href: postHref(post),
  dateLabel: post.publishedAt ? formatFullDate(post.publishedAt) : '',
  tag: postTag(post),
  excerpt: postSummary(post),
  photo:
    (typeof post.heroImage === 'object' && post.heroImage ? toPhoto(post.heroImage) : null) ??
    defaultPhoto,
})

const toArticleAuthor = (post: Post): ArticleAuthor => {
  const person = typeof post.authorPerson === 'object' ? post.authorPerson : null
  // Fallback na uživatele z pole Autoři (jméno, role, portrét; e-mail se veřejně nevystavuje)
  const user = post.populatedAuthors?.[0] ?? null
  const name = person?.name ?? user?.name ?? CLUB_NAME
  return {
    name,
    initials: initials(name) || 'HC',
    role: person?.role ?? user?.role ?? null,
    note: person?.note ?? null,
    email: person?.email ?? null,
    photo: person ? uploadToPhoto(person.photo) : uploadToPhoto(user?.photo),
  }
}

/** Payload dokument → view-model detailu, včetně fallbacků hero varianty. */
export const toArticleDetail = (
  post: Post,
  defaultPhoto: Photo | null = null,
  /** Slug zápasu z druhé strany vazby (`matches.report`) — viz `fetchMatchSlugForPost`. */
  matchSlug: string | null = null,
): ArticleDetail => {
  const photo =
    (typeof post.heroImage === 'object' && post.heroImage ? toPhoto(post.heroImage) : null) ??
    defaultPhoto
  const match = typeof post.match === 'object' ? post.match : null
  const scoreboard = match ? toScoreboard(match) : null

  // Fallbacky: varianta se bez potřebných dat bezpečně sníží na typografickou.
  let variant = post.heroVariant ?? 'foto'
  if (variant === 'zapas' && !scoreboard) variant = 'typograficke'
  if ((variant === 'foto' || variant === 'rozdelene' || variant === 'panel') && !photo) {
    variant = 'typograficke'
  }

  const words =
    post.contentType === 'html' && post.legacyHtml
      ? htmlWordCount(post.legacyHtml)
      : lexicalWordCount(post.content)

  return {
    id: post.id,
    slug: post.slug ?? '',
    title: post.title,
    titleHighlight:
      post.titleHighlight && post.title.includes(post.titleHighlight) ? post.titleHighlight : null,
    variant,
    badge: postTag(post),
    excerpt: post.excerpt ?? null,
    photo,
    photoCaption: post.photoCaption ?? null,
    dateLabel: post.publishedAt ? formatLongDate(post.publishedAt) : '',
    readingLabel: readingLabel(words),
    author: toArticleAuthor(post),
    scoreboard: variant === 'zapas' ? scoreboard : null,
    matchHref: linkOrNull(routes.match, match?.slug ?? matchSlug),
    tags: (post.categories ?? [])
      .map((category) => (typeof category === 'object' ? category.title : null))
      .filter((title): title is string => Boolean(title)),
    showRelated: post.showRelated ?? true,
  }
}
