import type { Payload } from 'payload'

import type { AhlMatchDetail } from '@/ahl'
import { relId } from '@/landing/lib/payload'
import { CLUB_NAME } from '@/lib/club'
import { utcToPragueLocal } from '@/lib/datetime'
import { slugifyCs } from '@/lib/slugifyCs'
import type { Match, Post } from '@/payload-types'

import { ourSide } from './matchDetail'

type Side = 'home' | 'away'

/** Uzel odstavce v Lexicalu; tvar kopíruje reportáže, které už v DB jsou. */
type TextNode = {
  mode: 'normal'
  text: string
  type: 'text'
  style: ''
  detail: 0
  format: 0 | 1
  version: 1
}

const text = (value: string, bold = false): TextNode => ({
  mode: 'normal',
  text: value,
  type: 'text',
  style: '',
  detail: 0,
  format: bold ? 1 : 0,
  version: 1,
})

const paragraph = (...children: TextNode[]) => ({
  type: 'paragraph' as const,
  format: '' as const,
  indent: 0 as const,
  version: 1 as const,
  children,
  direction: 'ltr' as const,
  textFormat: 0 as const,
})

type Lexical = NonNullable<Post['content']>

const doc = (...children: ReturnType<typeof paragraph>[]): Lexical =>
  ({
    root: { type: 'root', format: '', indent: 0, version: 1, children, direction: 'ltr' },
  }) as unknown as Lexical

/** `5:6 sn` — pořadí domácí:hosté, jako na AHL i v titulku. */
export function scoreLabel(detail: AhlMatchDetail): string {
  const s = detail.score
  if (!s) return ''
  return `${s.home}:${s.away}${s.suffix ? ` ${s.suffix}` : ''}`
}

/**
 * „HC Čestice – Soupeř 5:6 sn". Pořadí je domácí–hosté, takže u venkovního
 * zápasu stojí soupeř vpředu a skóre odpovídá tomuto pořadí.
 */
export function draftTitle(
  opponentName: string,
  weAreHome: boolean,
  detail: AhlMatchDetail,
): string {
  const pair = weAreHome ? `${CLUB_NAME} – ${opponentName}` : `${opponentName} – ${CLUB_NAME}`
  const score = scoreLabel(detail)
  return score ? `${pair} ${score}` : pair
}

/** `2026-10-04-pardubice`; bez diakritiky, protože slug jde do URL. */
export function draftSlug(day: string, opponentName: string): string {
  const name = slugifyCs(opponentName)
  return name ? `${day}-${name}` : day
}

/** Minuta ze stavu `mm:ss`: 30:41 je 31. minuta, nájezd (60:00) se píše slovy. */
function goalTime(time: string, shootout: boolean): string {
  if (shootout && time === '60:00') return 'nájezd'
  return time
}

/** Naše branky jako text: `12:34 Jméno (asistent, asistent)`; síla jen když není 5/5. */
export function ourGoalsLine(detail: AhlMatchDetail, side: Side): string {
  const shootout = detail.score?.suffix === 'sn'
  const ours = detail.goals.filter((g) => g.side === side)
  if (ours.length === 0) return 'naše strana branku nevstřelila.'
  return ours
    .map((g) => {
      const assists = g.assists.map((a) => a.name).join(', ')
      const strength =
        g.strength && g.strength !== '5/5' && !(shootout && g.time === '60:00')
          ? ` ${g.strength}`
          : ''
      return `${goalTime(g.time, shootout)} ${g.scorer.name}${assists ? ` (${assists})` : ''}${strength}`
    })
    .join(', ')
}

/** Třetiny v pořadí domácí:hosté; čtvrtá položka u AHL je prodloužení. */
export function periodsLabel(detail: AhlMatchDetail): string {
  const p = detail.periods
  if (p.length === 0) return ''
  const thirds = p
    .slice(0, 3)
    .map((x) => `${x.home}:${x.away}`)
    .join(', ')
  const ot = p[3] ? `, prodloužení ${p[3].home}:${p[3].away}` : ''
  return `${thirds}${ot}`
}

/**
 * Obsah konceptu: výsledek s třetinami, naše branky a prázdný odstavec pro
 * redaktora. Nic z toho se nepublikuje — koncept je podklad, ne článek.
 */
export function buildDraftContent(
  detail: AhlMatchDetail,
  side: Side,
  opponentName: string,
  weAreHome: boolean,
): Lexical {
  const pair = weAreHome ? `${CLUB_NAME} – ${opponentName}` : `${opponentName} – ${CLUB_NAME}`
  const periods = periodsLabel(detail)
  return doc(
    paragraph(
      text('Výsledek: ', true),
      text(`${pair} ${scoreLabel(detail)}${periods ? ` (${periods})` : ''}.`),
    ),
    paragraph(text('Branky Čestic: ', true), text(ourGoalsLine(detail, side))),
    paragraph(text('Doplňte text reportáže…')),
  )
}

/**
 * Koncept reportáže po zápase (`_status: 'draft'`, vazba `match`, hero
 * varianta E). Vrací true, když koncept vznikl — `run.ts` pak nastaví
 * `ahl.draftPostCreated`, aby se smazaný koncept při dalším běhu nezaložil
 * znovu.
 *
 * Co koncept záměrně NEDĚLÁ: nepublikuje se a `match.report` se nenastavuje
 * (karta zápasu by odkazovala na nepublikovaný článek). Drafty neprojdou do
 * sitemap, `llms.txt` ani výpisů — všechny filtrují `_status: published`.
 * Existuje-li už k zápasu jakýkoli článek (např. reportáž z importu), druhý
 * koncept se nezakládá.
 */
export async function createDraftPost(
  payload: Payload,
  matchDoc: Match,
  detail: AhlMatchDetail,
): Promise<boolean> {
  const side = ourSide(detail)
  if (!side) return false

  const existing = await payload.count({
    collection: 'posts',
    where: { match: { equals: matchDoc.id } },
  })
  if (existing.totalDocs > 0) {
    payload.logger.info(
      `vchl-sync: k zápasu ${matchDoc.id} už článek existuje, koncept se nezakládá`,
    )
    return false
  }

  const opponentId = relId(matchDoc.opponent)
  let opponentName = 'soupeř'
  if (opponentId != null) {
    const opp = await payload
      .findByID({ collection: 'opponents', id: opponentId, depth: 0 })
      .catch(() => null)
    if (opp?.name) opponentName = opp.name
  }

  const weAreHome = side === 'home'
  const day = utcToPragueLocal(matchDoc.date).day
  const base = draftSlug(day, opponentName)

  // Slug musí být unikátní; kolize (dva zápasy se stejným soupeřem v jeden
  // den, nebo ručně založený článek) se řeší číselnou příponou.
  let slug = base
  for (let n = 2; n < 20; n++) {
    const taken = await payload.count({ collection: 'posts', where: { slug: { equals: slug } } })
    if (taken.totalDocs === 0) break
    slug = `${base}-${n}`
  }

  await payload.create({
    collection: 'posts',
    draft: true,
    depth: 0,
    context: { disableRevalidate: true },
    data: {
      _status: 'draft',
      title: draftTitle(opponentName, weAreHome, detail),
      // Slug se zadává ručně; bez `generateSlug: false` by ho plugin přepsal z titulku.
      generateSlug: false,
      slug,
      type: 'report',
      heroVariant: 'zapas',
      contentType: 'richText',
      match: matchDoc.id,
      season: relId(matchDoc.season),
      team: relId(matchDoc.team),
      content: buildDraftContent(detail, side, opponentName, weAreHome),
    },
  })
  return true
}
