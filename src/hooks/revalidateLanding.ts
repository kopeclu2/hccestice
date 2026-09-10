import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import { LANDING_CACHE_TAGS } from '@/landing/data/tags'

/**
 * Prerenderované landing stránky, které se plní z kolekcí mimo layout
 * builder.
 *
 * Dynamické routy (`/aktuality/[slug]`, `/fotogalerie/[slug]`) tu být
 * nemohou: `revalidatePath` u nich vyžaduje druhý argument a chování je
 * křehké. Pokrývá je tagová revalidace v datové vrstvě.
 *
 * `/aktuality`, `/fotogalerie` a `/zapasy` tu **záměrně nejsou**, i když
 * tu dřív byly. Čtou `searchParams`, takže jsou plně dynamické a žádnou
 * cache entry routy nemají — `revalidatePath` na nich byl no-op, který
 * budil dojem, že jsou pokryté. Pokrývají je tagy níž.
 */
const LANDING_PATHS = ['/', '/historie-klubu', '/soupiska', '/sponzori'] as const

/**
 * Přegeneruje landing stránky po změně obsahu, který je napájí
 * (kolekce `people`, `players`, `sponsors`, `milestones`, `matches`,
 * `galleries`, `seasons`, `products`, `posts` a global `siteConfig`).
 *
 * Změny home stránky samotné revaliduje `revalidatePage` hook kolekce Pages.
 *
 * Importní/seed skripty revalidaci vypínají přes
 * `context.disableRevalidate` (mimo Next runtime by spadla).
 */
const revalidate = (
  doc: unknown,
  context: Record<string, unknown>,
  logger: { info: (msg: string) => void },
) => {
  // Drafty (autosave) přeskočit: landing zobrazuje jen publikovaný obsah
  // a autosave běží i BĚHEM renderu admin view, kde je revalidatePath
  // zakázané (Next by spadl na „used revalidatePath during render").
  const isDraft =
    typeof doc === 'object' && doc !== null && '_status' in doc && doc._status === 'draft'

  if (context.disableRevalidate || isDraft) return

  logger.info(`Revaliduji landing stránky (${LANDING_PATHS.join(', ')})`)
  for (const path of LANDING_PATHS) revalidatePath(path)

  /* Datová vrstva dynamických výpisů. Profil `{ expire: 0 }`, ne
     doporučované `'max'`: `'max'` je stale-while-revalidate, takže první
     návštěvník po uložení dostane ještě starý výpis a změna se objeví až
     tomu dalšímu (ověřeno u režimu údržby — viz `revalidateMaintenance`).
     U redakčního obsahu to redakce čte jako „ukládání nefunguje". */
  logger.info(`Invaliduji cache tagy (${LANDING_CACHE_TAGS.join(', ')})`)
  for (const tag of LANDING_CACHE_TAGS) revalidateTag(tag, { expire: 0 })
}

export const revalidateLanding: CollectionAfterChangeHook & GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  revalidate(doc, context, payload.logger)
  return doc
}

/**
 * Stejná revalidace po smazání dokumentu. Bez tohoto hooku zůstane smazaný
 * hráč, sponzor, zápas nebo galerie na landingu viditelný až do dalšího
 * buildu — což je u stránek bez ISR navždy.
 */
export const revalidateLandingDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  revalidate(doc, context, payload.logger)
  return doc
}
