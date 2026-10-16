import 'server-only'

import { unstable_cache } from 'next/cache'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

import configPromise from '@payload-config'

import type { CacheTag } from './tags'

/**
 * Payload klient pro datovou vrstvu — `getPayload({ config })` na jednom místě.
 *
 * `getPayload` si instanci drží sám (`global`) a umí ji v devu po změně
 * configu přeložit, proto tu **není** modulová proměnná: ta by po HMR
 * držela starou instanci. React `cache()` jen sloučí opakovaná volání
 * v rámci jednoho renderu; mimo render (uvnitř `unstable_cache`, v route
 * handleru) prostě zavolá `getPayload`.
 */
export const getPayloadClient: () => Promise<Payload> = cache(() =>
  getPayload({ config: configPromise }),
)

export type CachedQueryOptions = {
  /**
   * Jméno cache entry. Spolu s `version` tvoří `keyParts` pro `unstable_cache`
   * (`[key, version]`, bez `version` jen `[key]`) — musí zůstat stejné jako
   * u fetcheru, který se převádí, jinak se zahodí rozehřátá cache.
   */
  key: string
  /**
   * Verze tvaru výsledku (`'v3'`). Zvedá se, kdykoli se změní tvar dat nebo
   * obsah popisků, jinak by stará entry v `.next/cache` shodila stránku.
   */
  version?: string
  /** Aspoň jeden tag z `CACHE_TAGS` — bez něj by cache nešlo z hooku invalidovat. */
  tags: readonly [CacheTag, ...CacheTag[]]
  /**
   * Záchranná síť pod tagem v sekundách (výchozí hodinu). `unstable_cache`
   * bez ní žije **rok** a `export const revalidate` na stránce ho neobnoví,
   * takže při selhaném hooku (seed s `disableRevalidate`, výjimka při zápisu)
   * by zůstala stará data.
   */
  revalidate?: number
}

/**
 * Tagovaná datová cache mezi requesty + deduplikace v rámci renderu:
 * `cache(unstable_cache(fn, [key, version], { tags, revalidate }))`.
 *
 * Pravidla z AGENTS.md („Cache a renderovací režimy"), která tu platí:
 *
 * - **Tag i `revalidate`.** Obojí je povinné — tag dává okamžitou invalidaci
 *   z hooku, `revalidate` pojistku.
 * - **Žádné `new Date()` uvnitř `fn`.** Zamrzne v ní na celou dobu života
 *   entry. Čas, na kterém výsledek závisí, spočítejte venku a předejte
 *   argumentem — vstoupí do klíče (viz `scheduleFrom()` v `matches.ts`).
 * - **Argumenty a výsledek musí být serializovatelné do JSON.** Číselné klíče
 *   objektů se vrátí jako řetězce, `Date` jako řetězec.
 *
 * Argumenty se do klíče přidávají automaticky (`unstable_cache`), takže každá
 * jejich kombinace je vlastní entry. Pozor: React `cache()` porovnává
 * argumenty identitou, takže objekt vytvořený na místě se v rámci renderu
 * nededuplikuje (entry v `unstable_cache` ano).
 */
export function cachedQuery<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  { key, version, tags, revalidate = 3600 }: CachedQueryOptions,
): (...args: A) => Promise<R> {
  const keyParts = version ? [key, version] : [key]
  return cache(unstable_cache(fn, keyParts, { tags: [...tags], revalidate }))
}
