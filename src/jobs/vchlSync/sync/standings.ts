import { parseCompetitionInfo, parseStandings, tabulkyUrl } from '@/ahl'

import type { SeasonCtx } from '../context'
import { sameValue } from '../diff'
import { span } from '../sentry'
import type { SyncContext } from './ctx'

/**
 * Tabulka se přepisuje celá — řádek nemá ID, takže párování po řádcích by
 * při změně pořadí nechalo osiřelé hodnoty. Zapíše se jen při rozdílu
 * normalizovaného obsahu (bez `id` řádků), jinak by každý běh přidal záznam
 * do auditu a spustil revalidaci.
 */
export async function syncStandings(ctx: SyncContext, season: SeasonCtx): Promise<void> {
  await span('vchl.standings', async () => {
    const url = tabulkyUrl(season.competitionYearId)
    const html = await ctx.client.get(url)
    const rows = parseStandings(html).map((r) => ({
      pos: r.pos,
      team: r.team,
      games: r.games,
      points: r.points,
      wins: r.wins,
      otWins: r.otWins,
      otLosses: r.otLosses,
      losses: r.losses,
      goalsFor: r.goalsFor,
      goalsAgainst: r.goalsAgainst,
    }))

    const existing = season.doc.standings
    const same = sameValue(existing?.rows, rows) && existing?.fullTableUrl === url
    if (same) return

    // Popisek se dopíše jen prázdný — správce ho může mít formulovaný po svém.
    const label = existing?.label || parseCompetitionInfo(html).label
    const standings = { label, fullTableUrl: url, rows, syncedAt: ctx.now.toISOString() }

    ctx.recordDiff({
      entity: 'seasons',
      key: `season:${season.id}`,
      label: `${season.title} — tabulka`,
      action: 'update',
      fields: ['standings.rows', 'standings.fullTableUrl'],
      before: { rows: existing?.rows?.length ?? 0, fullTableUrl: existing?.fullTableUrl ?? null },
      after: { rows: rows.length, fullTableUrl: url },
    })
    await ctx.update('seasons', season.id, { standings })
    ctx.changes.standingsUpdated += 1
  })
}
