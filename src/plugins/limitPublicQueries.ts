import type { CollectionBeforeOperationHook, Plugin } from 'payload'

/** Strop `limit` pro anonymní čtení přes REST / GraphQL. */
export const PUBLIC_MAX_LIMIT = 100

/** Strop `depth` pro anonymní čtení — nejvíc, co web sám potřebuje. */
export const PUBLIC_MAX_DEPTH = 2

type ListArgs = {
  limit?: number
  depth?: number
  pagination?: boolean
}

/**
 * Čistá logika stropů, aby šla testovat bez Payloadu.
 *
 * - `limit` nad strop se srazí na `PUBLIC_MAX_LIMIT`. `limit: 0` Payload
 *   bere jako „vrať všechno" (`usePagination = pagination && limit !== 0`),
 *   stejně jako `pagination: false` bez limitu (`sanitizedLimit` = 0), takže
 *   obojí je taky `PUBLIC_MAX_LIMIT`.
 * - `pagination` se vždy vrací zapnutá — vypnutá by `limit` obešla.
 * - `depth` nad strop se srazí; nezadaný zůstává (platí `defaultDepth` 2,
 *   a ten už strop splňuje).
 *
 * Dotaz, který limit ani pagination nezmiňuje (`findByID`, `find` s
 * výchozím `limit` 10), se nemění — jen se mu případně sníží `depth`.
 */
export function clampPublicQuery<T extends ListArgs>(args: T): T {
  const next: T = { ...args }

  if (next.depth !== undefined && next.depth > PUBLIC_MAX_DEPTH) {
    next.depth = PUBLIC_MAX_DEPTH
  }

  const listing = next.limit !== undefined || next.pagination === false
  if (listing) {
    const limit = next.limit
    next.limit = !limit || limit < 0 || limit > PUBLIC_MAX_LIMIT ? PUBLIC_MAX_LIMIT : limit
    next.pagination = true
  }

  return next
}

/**
 * Pojistka proti drahým anonymním dotazům: veřejný `GET /api/<kolekce>`
 * (a GraphQL) jinak přijme `?limit=100000&depth=10` a Postgres s Node
 * procesem na boxu bez swapu to dají jen jednou.
 *
 * Hook `beforeOperation` běží pro `find`, `findByID`, `findVersions`
 * i `findVersionByID` (všechny se hlásí jako `read`) a Payload po něm čte
 * vrácené `args` — ověřeno v `payload/dist/collections/operations/find.js`
 * a `findByID.js`, kde se `limit` / `depth` / `pagination` destrukturují
 * až z výsledku `buildBeforeOperation`.
 *
 * Neomezuje se Local API (`payloadAPI === 'local'`: fetchery webu, seed,
 * jobs) ani přihlášený uživatel (admin). Není `server-only`, protože ho
 * načítá `payload.config.ts`.
 *
 * Musí být v `plugins` až za všemi pluginy, které přidávají kolekce
 * (hook se věší jen na kolekce, které v configu už jsou), a před `auditor()`.
 */
export const limitPublicQueries = (): Plugin => (config) => {
  const hook: CollectionBeforeOperationHook = ({ args, operation, req }) => {
    if (operation !== 'read') return
    if (req.payloadAPI === 'local' || req.user) return
    // Typ `args` je unie všech operací a `clampPublicQuery` je generická
    // nad strukturou, kterou čtení sdílí; cast jen kvůli téhle unii.
    return clampPublicQuery(args as ListArgs) as typeof args
  }

  for (const collection of config.collections ?? []) {
    collection.hooks = {
      ...collection.hooks,
      beforeOperation: [...(collection.hooks?.beforeOperation ?? []), hook],
    }
  }

  return config
}
