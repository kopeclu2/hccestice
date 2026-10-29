import 'server-only'

import { cachedQuery, getPayloadClient } from '@/landing/data/query'
import { CACHE_TAGS } from '@/landing/data/tags'
import { buildLineup, type MatchLineup } from '@/landing/features/matches/view/matchLineup'
import { isMatchHidden } from '@/lib/matchVisibility'
import type { Match } from '@/payload-types'

/**
 * Soupiska zápasu pro blok v rich textu. Je to **oddělený** fetcher s vlastní
 * cache: `lineup` je nejdelší pole zápasu a z `fetchMatchDetail` je záměrně
 * vynechané (detail `/zapasy/[slug]` sestavu nezobrazuje, jinak by se
 * serializovala do jeho cache). Čte jen `lineup` a jméno hráče z relace.
 *
 * Tag `matches-list` + `revalidate` — viz AGENTS.md („Cache a renderovací
 * režimy"); žádné `new Date()`. `null` = zápas neexistuje nebo nemá sestavu.
 */
export const fetchMatchLineup = cachedQuery(
  async (matchId: number): Promise<MatchLineup | null> => {
    const payload = await getPayloadClient()
    const match = (await payload.findByID({
      collection: 'matches',
      id: matchId,
      depth: 1,
      select: { lineup: true, hiddenOnWeb: true },
      populate: { players: { name: true } },
      disableErrors: true,
    })) as Pick<Match, 'lineup' | 'hiddenOnWeb'> | null
    return match && !isMatchHidden(match) ? buildLineup(match.lineup) : null
  },
  { key: 'match-lineup', version: 'v1', tags: [CACHE_TAGS.matches] },
)
