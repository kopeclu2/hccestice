import { writeFileSync } from 'fs'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * Oprava legacy přesměrování z eStránek na fotogalerie.
 *
 * PROBLÉM: import (18. 8. 2026) zapsal cíle jako `type: 'custom'` s URL
 * odvozenou z původní cesty, kde nechal tečky. Slugifier kolekce `galleries`
 * ale tečku **maže bez náhrady**, ne že by ji nahradil pomlčkou:
 *
 *   redirect chce  /fotogalerie/hc-cestice-x-zh-pardubice---19.ledna-2025
 *   galerie má     /fotogalerie/hc-cestice-x-zh-pardubice---19ledna-2025
 *
 * Výsledek: 70 ze 101 galerijních přesměrování skončí na 404. Zbylých 31
 * funguje jen proto, že v jejich názvu žádná tečka nebyla.
 *
 * Článková přesměrování (269 kusů) tímhle netrpí — používají `type:
 * 'reference'`, tedy relaci na dokument, takže se resolvují přes ID.
 * Pro galerie to zatím nejde: `redirectsPlugin` má v `src/plugins/index.ts`
 * povolené jen `collections: ['pages', 'posts']`. Přidat tam `galleries` by
 * změnilo schéma polymorfní relace, což v produkci znamená migraci — proto
 * tenhle skript opravuje jen zapsanou URL a typ `custom` nechává.
 *
 * PÁROVÁNÍ je bezpečné: porovnává se slug zbavený všeho kromě `[a-z0-9]`.
 * Ověřeno, že je bijektivní — 101 galerií dá 101 unikátních normalizovaných
 * klíčů a 101 redirectů taky, takže žádné dva se nepletou a nikoho nelze
 * poslat do cizí galerie. Skript to kontroluje znovu za běhu a při kolizi
 * skončí bez zápisu.
 *
 * Spuštění:
 *   bunx payload run migration/fix-gallery-redirects.ts            # dry-run
 *   bunx payload run migration/fix-gallery-redirects.ts -- --apply # zápis
 *
 * Report jde do `migration/data/fix-gallery-redirects.log` — stdout se
 * u `payload run` ztrácí.
 */

const APPLY = process.argv.includes('--apply')
const PREFIX = '/fotogalerie/'
const LOG_FILE = 'migration/data/fix-gallery-redirects.log'

/** Klíč pro párování: jen alfanumerické znaky, takže tečky/pomlčky nehrají roli. */
const norm = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '')

const payload = await getPayload({ config })
const log: string[] = [`# fix-gallery-redirects (${APPLY ? 'APPLY' : 'DRY-RUN'})`, '']

const galleries = await payload.find({
  collection: 'galleries',
  limit: 0,
  depth: 0,
  pagination: false,
  overrideAccess: true,
})

const redirects = await payload.find({
  collection: 'redirects',
  limit: 0,
  depth: 0,
  pagination: false,
  overrideAccess: true,
})

/* ── kontrola jednoznačnosti PŘED jakýmkoli zápisem ─────────────────────── */

const byKey = new Map<string, string[]>()
for (const gallery of galleries.docs) {
  const slug = gallery.slug
  if (!slug) continue
  byKey.set(norm(slug), [...(byKey.get(norm(slug)) ?? []), slug])
}

const collisions = [...byKey.entries()].filter(([, slugs]) => slugs.length > 1)
if (collisions.length > 0) {
  log.push('PŘERUŠENO: normalizované slugy galerií nejsou unikátní, párování by')
  log.push('mohlo poslat návštěvníka do cizí galerie. Kolize:')
  for (const [key, slugs] of collisions) log.push(`  ${key} → ${slugs.join(', ')}`)
  writeFileSync(LOG_FILE, log.join('\n'))
  throw new Error(`Kolize normalizovaných slugů (${collisions.length}) — nic nezapsáno.`)
}

const galleryBySlug = new Map<string, string>()
for (const [key, slugs] of byKey) galleryBySlug.set(key, slugs[0]!)

/* ── vlastní oprava ─────────────────────────────────────────────────────── */

const galleryRedirects = redirects.docs.filter((doc) => {
  const url = doc.to?.url
  return typeof url === 'string' && url.startsWith(PREFIX)
})

let fixed = 0
let alreadyOk = 0
let unmatched = 0

for (const doc of galleryRedirects) {
  const currentUrl = doc.to!.url as string
  const wantedSlug = currentUrl.slice(PREFIX.length)

  // cíl už existuje → není co opravovat
  if (galleries.docs.some((gallery) => gallery.slug === wantedSlug)) {
    alreadyOk++
    continue
  }

  const realSlug = galleryBySlug.get(norm(wantedSlug))
  if (!realSlug) {
    log.push(`NENALEZENO  ${doc.from}`)
    log.push(`            cíl ${currentUrl} nemá odpovídající galerii`)
    unmatched++
    continue
  }

  const newUrl = `${PREFIX}${realSlug}`
  log.push(`OPRAVA      ${doc.from}`)
  log.push(`            ${currentUrl}`)
  log.push(`         →  ${newUrl}`)

  if (APPLY) {
    await payload.update({
      collection: 'redirects',
      id: doc.id,
      data: { to: { type: 'custom', url: newUrl } },
      overrideAccess: true,
      // Hromadný update mimo Next runtime — bez tohohle spadne revalidateTag
      // na „Invariant: static generation store missing".
      context: { disableRevalidate: true },
    })
  }
  fixed++
}

log.push('')
log.push(`galerií:                ${galleries.totalDocs}`)
log.push(`přesměrování celkem:    ${redirects.totalDocs}`)
log.push(`z toho na fotogalerie:  ${galleryRedirects.length}`)
log.push(`už v pořádku:           ${alreadyOk}`)
log.push(`${APPLY ? 'opraveno:              ' : 'k opravě:              '} ${fixed}`)
log.push(`nedohledatelných:       ${unmatched}`)
if (!APPLY) log.push('', 'DRY-RUN — nic nezapsáno. Pro zápis přidej `-- --apply`.')
if (APPLY && fixed > 0) {
  log.push('')
  log.push('DŮLEŽITÉ — bez tohohle kroku se změna neprojeví:')
  log.push('Přesměrování se čtou přes `unstable_cache` s tagem `redirects` a bez')
  log.push('`revalidate`, takže mají TTL jeden rok. Tenhle skript posílá')
  log.push('`disableRevalidate: true` (jinak by `revalidateTag` mimo Next runtime')
  log.push('spadl), takže tag zůstal platný. REBUILD NESTAČÍ — cache přežívá')
  log.push('v `.next/cache`.')
  log.push('')
  log.push('  produkce: otevřít v adminu jakékoli Přesměrování a dát Uložit')
  log.push('            (hook `revalidateRedirects` zneplatní celý tag)')
  log.push('  lokálně:  rm -rf .next/cache && bun run start')
}

writeFileSync(LOG_FILE, log.join('\n'))
