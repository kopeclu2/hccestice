/**
 * Fáze 0 a 1 plánu opravy SEO auditu (21. 8. 2026).
 *
 * Fáze 0 — příprava obsahu:
 *   0.1  založí stránku `/kontakty` z obsahu legacy `/kontaky`
 *        (bez odstavce s osobním e-mailem administrátora, s opravou
 *        překlepu „@seznam cz" → „@seznam.cz")
 *   0.3  přidá „Kontakty" do kontejneru navigace `hlavni`
 *   0.4  301 `/kontaky` → `/kontakty`
 *
 * Fáze 1 — úklid obsahu: odpublikuje legacy/demo stránky a testovací
 *   články. Nemaže — `_status: 'draft'` je vratné a dokumenty zůstanou
 *   v adminu dohledatelné.
 *
 * Proč odpublikovat a ne `noindex`: `pages-sitemap.xml`, `llms.txt/route.ts`
 * i frontend filtrují `_status: published`, takže jeden zápis vyřeší 404,
 * zmizení ze sitemapy i z `/llms.txt`. Pole `robots` na kolekci neexistuje
 * a jeho přidání by znamenalo migraci (v produkci je `push` vypnutý).
 *
 * Spuštění:
 *   bun --env-file=.env migration/seo-cleanup.ts            # dry run
 *   bun --env-file=.env migration/seo-cleanup.ts --apply    # zápis
 *
 * Proti produkci přes tunel (viz scripts/db-tunnel.sh):
 *   DATABASE_URL=postgres://…@127.0.0.1:5433/postgres \
 *     bun migration/seo-cleanup.ts --apply
 *
 * POZOR: zápis do databáze sám o sobě živý web nezmění. Stránky jsou
 * prerenderované a `unstable_cache` má bez `revalidate` TTL jeden rok,
 * takže po spuštění je potřeba redeploy (`gh workflow run deploy.yml`).
 * Skript proto posílá `disableRevalidate` — `revalidateTag` mimo Next
 * runtime by spadl na `Invariant: static generation store missing`.
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const APPLY = process.argv.includes('--apply')
const ctx = { disableRevalidate: true }

const payload = await getPayload({ config })

const mode = APPLY ? 'ZÁPIS' : 'DRY RUN (bez --apply se nic nezmění)'
console.log(`\n=== seo-cleanup — ${mode} ===`)
console.log(`=== cíl: ${process.env.NEXT_PUBLIC_SERVER_URL} ===\n`)

/** Stránky, které mají zmizet z indexu. `kontaky` až po vzniku `kontakty`. */
const UNPUBLISH_PAGES = [
  'navod',
  'pomocna-uvodni-stranka',
  'ukazka-sekci',
  'produkty-merch',
  'hracske-prispevky-pro-sezonu-2010---2011',
  'reklamni-predmety-2024-2025',
  'kontaky',
]

/** Testovací články z legacy importu. */
const UNPUBLISH_POSTS = ['ttt', 'tab', 'test-vysledky', 'dotaznik', 'zaloha-uvodni-strany']

const findOne = async (collection: 'pages' | 'posts', slug: string) => {
  const res = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  return (res.docs[0] as any) ?? null
}

// ---------------------------------------------------------------- fáze 0.1
console.log('--- 0.1 stránka /kontakty ---')

const legacyContact = await findOne('pages', 'kontaky')
const existingContact = await findOne('pages', 'kontakty')

if (!legacyContact) {
  console.log('  ! předloha `kontaky` v databázi není — krok přeskočen')
} else if (existingContact) {
  console.log(`  = /kontakty už existuje (id=${existingContact.id}) — přeskočeno`)
} else {
  /**
   * Dvě úpravy proti předloze:
   *  - odstavec s osobní adresou administrátora webu ven (je na 304
   *    veřejných stránkách, na kontaktní stránce klubu nemá co dělat)
   *  - „lukas.beranek84@seznam cz" → doplnit tečku; správná hodnota je
   *    potvrzená z kolekce People (id=1)
   */
  const cleanedLayout = JSON.parse(
    JSON.stringify(legacyContact.layout)
      .replace(/<p>(?:(?!<\/p>)[\s\S])*?little-devil(?:(?!<\/p>)[\s\S])*?<\/p>/g, '')
      .replace(/@seznam cz/g, '@seznam.cz'),
    // `id` bloků z předlohy se nesmí přenést — Payload je u `create`
    // odmítne jako neplatné (kolize s vlastním generováním).
    (key, value) => (key === 'id' ? undefined : value),
  )

  const stillHasEmail = JSON.stringify(cleanedLayout).includes('little-devil')
  const stillHasTypo = JSON.stringify(cleanedLayout).includes('@seznam cz')
  console.log(`  osobní e-mail odstraněn: ${!stillHasEmail ? 'ano' : 'NE — zkontrolovat ručně'}`)
  console.log(`  překlep v e-mailu opraven: ${!stillHasTypo ? 'ano' : 'NE'}`)

  if (APPLY) {
    const created = await payload.create({
      collection: 'pages',
      context: ctx,
      overrideAccess: true,
      data: {
        title: 'Kontakty',
        slug: 'kontakty',
        hero: JSON.parse(JSON.stringify(legacyContact.hero ?? null), (key, value) =>
          key === 'id' ? undefined : value,
        ),
        layout: cleanedLayout,
        meta: {
          title: 'Kontakty',
          description:
            'Kontakty na TJ Sokol Čestice — adresa klubu, předseda oddílu, trenéři a vedoucí mužstva.',
        },
        _status: 'published',
      } as any,
    })
    console.log(`  + vytvořeno /kontakty (id=${created.id}), publikováno`)
  } else {
    console.log('  + vytvořilo by /kontakty (published) z obsahu `kontaky`')
  }
}

// ---------------------------------------------------------------- fáze 0.3
console.log('\n--- 0.3 položka v navigaci `hlavni` ---')

const contactPage = await findOne('pages', 'kontakty')
const navItems = await payload.find({
  collection: 'navigation-items' as any,
  where: { url: { equals: '/kontakty' } },
  limit: 1,
  depth: 0,
  overrideAccess: true,
})
const containers = await payload.find({
  collection: 'navigation-containers' as any,
  where: { slug: { equals: 'hlavni' } },
  limit: 1,
  depth: 0,
  overrideAccess: true,
})
const container = (containers.docs[0] as any) ?? null

if (!container) {
  console.log('  ! kontejner `hlavni` nenalezen — krok přeskočen')
} else if (navItems.docs.length) {
  console.log(`  = položka na /kontakty už existuje (id=${navItems.docs[0].id}) — přeskočeno`)
} else if (!contactPage && !APPLY) {
  console.log('  + přidalo by položku „Kontakty" na konec kontejneru `hlavni`')
} else if (APPLY) {
  const item = await payload.create({
    collection: 'navigation-items' as any,
    context: ctx,
    overrideAccess: true,
    data: {
      title: 'Kontakty',
      // „Cesta nebo kotva" — /kontakty je ručně needitovaná podstránka,
      // varianta `internal` by vyžadovala relaci na kolekci pages.
      type: 'external',
      url: '/kontakty',
      // Prázdná kotva = sekce na homepage neexistuje, odkaz vede na podstránku.
      anchor: '',
      target: '_self',
      active: true,
      order: 0,
    } as any,
  })
  await payload.update({
    collection: 'navigation-containers' as any,
    id: container.id,
    context: ctx,
    overrideAccess: true,
    data: { items: [...(container.items ?? []), item.id] } as any,
  })
  console.log(`  + položka „Kontakty" (id=${item.id}) přidána na konec kontejneru`)
}

// ---------------------------------------------------------------- fáze 0.4
console.log('\n--- 0.4 přesměrování ---')

const REDIRECTS: Array<{ from: string; to: string }> = [
  { from: '/kontaky', to: '/kontakty' },
  { from: '/reklamni-predmety-2024-2025', to: '/reklamni-predmety' },
]

for (const r of REDIRECTS) {
  const existing = await payload.find({
    collection: 'redirects' as any,
    where: { from: { equals: r.from } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs.length) {
    console.log(`  = ${r.from} už přesměrování má — přeskočeno`)
    continue
  }
  if (APPLY) {
    await payload.create({
      collection: 'redirects' as any,
      context: ctx,
      overrideAccess: true,
      data: { from: r.from, to: { type: 'custom', url: r.to } } as any,
    })
    console.log(`  + ${r.from} -> ${r.to}`)
  } else {
    console.log(`  + vytvořilo by ${r.from} -> ${r.to}`)
  }
}

// ------------------------------------------------------------------ fáze 1
console.log('\n--- 1 odpublikování ---')

let changed = 0
let skipped = 0

for (const [collection, slugs] of [
  ['pages', UNPUBLISH_PAGES],
  ['posts', UNPUBLISH_POSTS],
] as const) {
  for (const slug of slugs) {
    const doc = await findOne(collection, slug)
    if (!doc) {
      console.log(`  ? ${collection}/${slug} — v databázi není`)
      continue
    }
    if (doc._status !== 'published') {
      console.log(`  = ${collection}/${slug} už je ${doc._status}`)
      skipped++
      continue
    }
    // `kontaky` smí zmizet jen když náhrada opravdu existuje.
    if (slug === 'kontaky' && !(await findOne('pages', 'kontakty'))) {
      console.log('  ! pages/kontaky — /kontakty ještě neexistuje, NEODPUBLIKOVÁNO')
      continue
    }
    if (APPLY) {
      await payload.update({
        collection,
        id: doc.id,
        context: ctx,
        overrideAccess: true,
        draft: false,
        data: { _status: 'draft' } as any,
      })
      console.log(`  - ${collection}/${slug} (id=${doc.id}) -> draft`)
    } else {
      console.log(`  - ${collection}/${slug} (id=${doc.id}) by šlo -> draft`)
    }
    changed++
  }
}

console.log(`\n=== hotovo: ${changed} ke změně, ${skipped} už bylo v cíli ===`)
if (!APPLY) console.log('=== dry run — spusťte znovu s --apply ===')
else
  console.log(
    '=== nutný redeploy, jinak zůstanou prerenderované stránky a cache sitemap/llms.txt ===',
  )

process.exit(0)
