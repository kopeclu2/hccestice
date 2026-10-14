import type { Payload } from 'payload'

import { AHL_BASE_URL, AhlParseError, isOurTeam, parseCompetitionInfo, tabulkyUrl } from '@/ahl'
import type { Season } from '@/payload-types'

import type { AhlClient } from '@/ahl/client'

import type { SyncContext } from './sync/ctx'

export type SeasonCtx = {
  id: number
  title: string
  startYear: number
  competitionYearId: number
  participantId: number
  doc: Season
}

/** Tým „Muži" — synchronizace se týká jen VČHL mužů. */
export async function resolveTeamId(payload: Payload): Promise<number> {
  const res = await payload.find({
    collection: 'teams',
    where: { slug: { equals: 'muzi' } },
    limit: 1,
    depth: 0,
  })
  const team = res.docs[0]
  if (!team) throw new Error('V CMS chybí tým se slugem „muzi"')
  return team.id
}

/**
 * Sezóny k synchronizaci: všechny `isCurrent`. ID ročníku a týmu mají
 * (a mění se s každým ročníkem, viz plán), takže:
 * - NEJNOVĚJŠÍ aktuální sezóna je může chybět — pak se dohledají autodetekcí
 *   ze stránky AHL (která ukazuje aktuální ročník) a uloží se do sezóny,
 * - starší aktuální sezóna bez ID se přeskočí. Autodetekce by jí přiřadila
 *   ročník, který patří té nejnovější, a přepsala by cizí zápasy.
 */
export async function resolveSeasons(ctx: SyncContext): Promise<SeasonCtx[]> {
  const res = await ctx.payload.find({
    collection: 'seasons',
    where: { isCurrent: { equals: true } },
    sort: '-startYear',
    limit: 0,
    depth: 0,
  })
  if (res.docs.length === 0) throw new Error('V CMS není žádná sezóna označená jako aktuální')

  const out: SeasonCtx[] = []
  for (const [i, doc] of res.docs.entries()) {
    let year = doc.ahl?.competitionYearId ?? null
    let participant = doc.ahl?.participantId ?? null

    if (!year || !participant) {
      if (i > 0) {
        ctx.warn({
          type: 'other',
          ref: `season:${doc.id}`,
          message: `Sezóna ${doc.title} je aktuální, ale nemá ID ročníku a týmu z AHL — přeskočeno.`,
        })
        continue
      }
      const found = await detectSeasonIds(ctx.client, year, participant, res.docs)
      year = found.year
      participant = found.participant
      const before = { ahl: doc.ahl ?? null }
      const after = { ahl: { competitionYearId: year, participantId: participant } }
      ctx.recordDiff({
        entity: 'seasons',
        key: `season:${doc.id}`,
        label: doc.title,
        action: 'update',
        fields: ['ahl.competitionYearId', 'ahl.participantId'],
        before,
        after,
      })
      await ctx.update('seasons', doc.id, after)
    }

    out.push({
      id: doc.id,
      title: doc.title,
      startYear: doc.startYear,
      competitionYearId: year,
      participantId: participant,
      doc,
    })
  }
  return out
}

/**
 * Autodetekce ID ročníku a týmu ze stránky AHL (sdílí ji job i admin endpoint).
 * `allCurrent` slouží k obraně proti ročníku, který už patří jiné sezóně.
 */
export async function detectSeasonIds(
  client: AhlClient,
  knownYear: number | null,
  knownParticipant: number | null,
  allCurrent: Season[],
): Promise<{ year: number; participant: number }> {
  // Bez ID ročníku ukazuje /tabulky/ ten aktuální.
  const url = knownYear ? tabulkyUrl(knownYear) : `${AHL_BASE_URL}/tabulky/`
  const info = parseCompetitionInfo(await client.get(url))

  const year = knownYear ?? info.competitionYearId
  if (!knownYear && allCurrent.some((s) => s.ahl?.competitionYearId === year)) {
    // AHL ještě ukazuje ročník, který už patří jiné sezóně (mezi sezónami).
    throw new AhlParseError('ročník', `autodetekovaný ročník ${year} už patří jiné sezóně`)
  }
  const ours = info.participants.find((p) => isOurTeam(p.name))
  const participant = knownParticipant ?? ours?.participantId
  if (!participant) throw new AhlParseError('ročník', `v ročníku ${year} není tým Čestice`)
  return { year, participant }
}
