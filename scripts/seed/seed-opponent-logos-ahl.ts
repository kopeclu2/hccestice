/**
 * Doplní soupeřům bez loga znak z ahl.cz.
 *
 * Synchronizace VČHL zakládá neznámého soupeře jen se jménem, takže každý
 * nový tým je na webu s monogramem místo znaku. AHL loga má — stránka
 * účastníka ukazuje dlaždice všech týmů ročníku
 * (`data//loga-teamu/medium_100/<kód>.png`, alt = plný název týmu).
 * Bereme variantu `large_200` (200 px; větší AHL nemá).
 *
 * Párování: nejdřív klíče jako v synchronizaci (`opponentKeys` / název
 * a aliasy bez předpon), pak jednoznačná shoda slov — „HC Orli B" (alias
 * „Orli B") je na AHL „TJ Orli Lanškroun B". Víc kandidátů = přeskočit.
 *
 * Idempotentní: soupeř s logem se přeskočí, existující loga se nepřepisují.
 * Zápis jde přes Local API, takže na produkci je nutné spustit proti její
 * databázi i jejímu `public/media` — lokální běh nahraje soubor jen lokálně.
 *
 * Spuštění: bun --env-file=.env scripts/seed/seed-opponent-logos-ahl.ts [--dry]
 */
import { getPayload } from 'payload'

import { AHL_USER_AGENT } from '@/ahl/client'
import { AHL_BASE_URL } from '@/ahl/urls'
import { ahlNameKeys, foldTeam, keysIntersect, opponentKeys } from '@/jobs/vchlSync/sync/opponents'
import { stripClubPrefix } from '@/lib/teamName'
import config from '@/payload.config'

const DRY = process.argv.includes('--dry')
const LOGO_SIZE = 'large_200'

type Tile = { name: string; code: string }

const get = async (url: string): Promise<Response> => {
  const res = await fetch(url, { headers: { 'User-Agent': AHL_USER_AGENT } })
  if (!res.ok) throw new Error(`ahl.cz ${url}: HTTP ${res.status}`)
  return res
}

/** Dlaždice týmů ze stránky účastníka (jsou na ní všechny týmy ročníku). */
const fetchTiles = async (participantId: number): Promise<Tile[]> => {
  const html = await (
    await get(`${AHL_BASE_URL}/ucastnici/?ucastniksouteznihorocnikuid=${participantId}`)
  ).text()
  const tiles: Tile[] = []
  const re =
    /<img class="ahl_team_tile_img" src="[^"]*\/loga-teamu\/[^/]+\/([^"/]+)\.png" alt="([^"]+)"/g
  for (const [, code, name] of html.matchAll(re)) tiles.push({ code, name })
  if (tiles.length === 0) throw new Error('ahl.cz: na stránce účastníka nejsou dlaždice týmů')
  return tiles
}

const words = (s: string): Set<string> => new Set(stripClubPrefix(foldTeam(s)).split(' '))

const isSubset = (a: Set<string>, b: Set<string>): boolean => [...a].every((w) => b.has(w))

const payload = await getPayload({ config })

const season = (
  await payload.find({
    collection: 'seasons',
    where: { isCurrent: { equals: true } },
    limit: 1,
    depth: 0,
  })
).docs[0]
const participantId = season?.ahl?.participantId
if (!participantId) throw new Error('Aktuální sezóna nemá ahl.participantId (spusť autodetekci)')

const tiles = (await fetchTiles(participantId)).filter((t) => t.code !== 'cestice')
console.log(`ahl.cz: ${tiles.length} týmů v ročníku (sezóna ${season.title})\n`)

const { docs: opponents } = await payload.find({ collection: 'opponents', limit: 0, depth: 0 })

let updated = 0
let missing = 0

for (const opp of opponents) {
  if (opp.logo) continue
  const keys = opponentKeys(opp)
  let candidates = tiles.filter((t) => keysIntersect(ahlNameKeys(t.name), keys))
  if (candidates.length === 0) {
    const names = [opp.name, ...(opp.aliases ?? []).map((a) => a.name)].filter(Boolean)
    candidates = tiles.filter((t) => names.some((n) => isSubset(words(n), words(t.name))))
  }
  if (candidates.length !== 1) {
    const why =
      candidates.length === 0
        ? 'v ročníku na AHL není'
        : `víc kandidátů: ${candidates.map((t) => t.name).join(', ')}`
    console.warn(`  ! ${opp.name}: ${why}`)
    missing++
    continue
  }

  const [tile] = candidates
  const url = `https://www.ahl.cz/data/loga-teamu/${LOGO_SIZE}/${tile.code}.png`
  if (DRY) {
    console.log(`  ~ ${opp.name} ← ${tile.name} (${url})`)
    continue
  }

  const data = Buffer.from(await (await get(url)).arrayBuffer())
  const media = await payload.create({
    collection: 'media',
    data: { alt: `Logo ${tile.name}` },
    file: { data, mimetype: 'image/png', name: `ahl-${tile.code}.png`, size: data.length },
    context: { disableRevalidate: true },
  })
  await payload.update({
    collection: 'opponents',
    id: opp.id,
    data: { logo: media.id },
    context: { disableRevalidate: true },
  })
  console.log(`  + ${opp.name} ← ${tile.name} (${media.filename})`)
  updated++
}

console.log(`\nSoupeři: +${updated} log doplněno, ${missing} bez shody${DRY ? ' (nanečisto)' : ''}`)
process.exit(0)
