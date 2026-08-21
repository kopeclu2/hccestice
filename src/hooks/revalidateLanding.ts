import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

import { revalidatePath } from 'next/cache'

/**
 * Landing stránky, které se plní z kolekcí mimo layout builder.
 * Většina z nich nemá `export const revalidate`, takže bez tohoto seznamu
 * se po buildu neobnoví vůbec — ne až za 10 minut, ale nikdy.
 *
 * Dynamické routy (`/aktuality/[slug]`, `/fotogalerie/[slug]`) tu být
 * nemohou: `revalidatePath` u nich vyžaduje druhý argument a chování je
 * křehké. Pokrývá je tagová revalidace v datové vrstvě.
 */
const LANDING_PATHS = [
  '/',
  '/aktuality',
  '/fotogalerie',
  '/historie-klubu',
  '/soupiska',
  '/sponzori',
  '/zapasy',
] as const

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
