import { revalidatePath, revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

import type { CacheTag } from '@/landing/data/tags'

/**
 * Profil invalidace tagu. Volba není kosmetická:
 *
 * - `{ expire: 0 }` — okamžitě. Pro **redakční obsah** (výpisy, navigace,
 *   údržba, nastavení): `'max'` je stale-while-revalidate, takže první
 *   návštěvník po uložení dostane ještě starou verzi a redakce to čte jako
 *   „ukládání nefunguje". `updateTag()` by expiroval taky okamžitě, ale jde
 *   volat jen ze Server Action; admin ukládá přes REST, kde vyhodí `E872`.
 * - `'max'` — stale-while-revalidate. Pro **crawlerské feedy** (sitemapy,
 *   `llms.txt`), kde první požadavek se starou verzí nikomu nevadí.
 */
export type RevalidateProfile = 'max' | { expire: 0 }

type Logger = { info: (message: string) => void }

export type RevalidationPlan = {
  /** Co se revaliduje, do logu: „navigaci", „feedy fotoalb". */
  label: string
  /** Tagy invalidované `profile`m. */
  tags: readonly CacheTag[]
  profile: RevalidateProfile
  /** Tagy crawlerských feedů, které se vždy invalidují profilem `'max'`. */
  feeds?: readonly CacheTag[]
  /** Cesty pro `revalidatePath` (jen prerenderované routy; dynamické výpisy řeší tagy). */
  paths?: readonly string[]
}

/**
 * Samotná revalidace bez kontroly kontextu a bez hooku. Používá ji
 * `createRevalidateHooks` a taky kód, který hook nemá, ale musí revalidovat
 * stejně — `/internal/revalidate`, odkud synchronizace VČHL revaliduje
 * z cronu (mimo request `revalidateTag` padá na
 * `Invariant: static generation store missing`).
 */
export function applyRevalidation(
  logger: Logger,
  { label, tags, profile, feeds = [], paths = [] }: RevalidationPlan,
): void {
  const parts = [
    tags.length + feeds.length ? `tagy: ${[...tags, ...feeds].join(', ')}` : '',
    paths.length ? `cesty: ${paths.join(', ')}` : '',
  ].filter(Boolean)
  logger.info(`Revaliduji ${label}${parts.length ? ` (${parts.join('; ')})` : ''}`)

  for (const path of paths) revalidatePath(path)
  for (const tag of tags) revalidateTag(tag, profile)
  for (const tag of feeds) revalidateTag(tag, 'max')
}

export type CreateRevalidateHooksOptions<T extends object = object> = Omit<
  RevalidationPlan,
  'paths'
> & {
  /**
   * Cesty podle dokumentu. U `afterChange` dostane i `previousDoc` (stará
   * adresa po změně slugu), u `afterDelete` jen smazaný dokument.
   */
  paths?: (doc: T, previousDoc?: T) => readonly string[]
  /**
   * Přeskočit rozepsané koncepty (`_status: 'draft'`). Autosave běží i
   * BĚHEM renderu admin view, kde je `revalidatePath` zakázané („used
   * revalidatePath during render"), a web ukazuje jen publikovaný obsah.
   */
  skipDrafts?: boolean
}

const isDraft = (doc: unknown): boolean =>
  typeof doc === 'object' && doc !== null && '_status' in doc && doc._status === 'draft'

/**
 * Továrna na revalidační hooky `afterChange` / `afterDelete`.
 *
 * Společné pro všechny: nic se neděje, když `context.disableRevalidate`
 * (seed a importní skripty — `revalidateTag` mimo Next runtime spadne), a hook
 * vždy vrací `doc` beze změny. `unstable_cache` bez `revalidate` žije rok,
 * takže bez těchto hooků by se změna v adminu neprojevila — nejsou to
 * optimalizace, ale podmínka funkčnosti (viz AGENTS.md „Cache a revalidace").
 *
 * `afterChange` je typovaný jako kolekční i globalový (`GlobalAfterChangeHook`),
 * `afterDelete` jen kolekční — globaly se nemažou.
 *
 * @example
 * export const { afterChange, afterDelete } = createRevalidateHooks({
 *   label: 'navigaci',
 *   tags: [CACHE_TAGS.navigation],
 *   profile: { expire: 0 },
 * })
 */
export function createRevalidateHooks<T extends object = object>(
  options: CreateRevalidateHooksOptions<T>,
): {
  afterChange: CollectionAfterChangeHook & GlobalAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} {
  const { paths, skipDrafts, ...plan } = options

  const afterChange: CollectionAfterChangeHook & GlobalAfterChangeHook = ({
    doc,
    previousDoc,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate || (skipDrafts && isDraft(doc))) return doc

    applyRevalidation(payload.logger, {
      ...plan,
      paths: paths?.(doc as T, previousDoc as T | undefined),
    })
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = ({ doc, req: { payload, context } }) => {
    if (context.disableRevalidate || (skipDrafts && isDraft(doc))) return doc

    applyRevalidation(payload.logger, { ...plan, paths: paths?.(doc as T) })
    return doc
  }

  return { afterChange, afterDelete }
}
