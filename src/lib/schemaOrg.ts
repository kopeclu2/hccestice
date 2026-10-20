import { ARENA_ADDRESS, ARENA_NAME } from './club'

/**
 * Společné díly strukturovaných dat (schema.org JSON-LD) — identifikátory
 * entit a uzly, které se na webu objevují na víc stránkách.
 *
 * Izomorfní a čisté (žádné `process.env`, žádné `new Date()`): základ adresy
 * (`getServerSideURL()`) předává volající, takže je to snadno testovatelné.
 * Každý výstup se do stránky dostává přes `serializeJsonLd`.
 *
 * Pravidlo `@id`: entita je v rámci **jednoho** dokumentu definovaná jednou
 * a ostatní výskyty jsou odkazy `{ '@id': … }`. Entity klubu mají stabilní
 * `@id` na domovské adrese (`<origin>/#arena`), takže se spojí i napříč
 * stránkami, i když je plná definice jen na některých.
 */

export const schemaIds = (baseUrl: string) => ({
  arena: `${baseUrl}/#arena`,
})

/** Odkaz na entitu podle `@id`. */
export const idRef = (id: string) => ({ '@id': id })

/**
 * Domácí hala — jediná definice `Place` s `@id`. `StadiumOrArena` je podtyp
 * `Place`, takže projde i jako `SportsEvent.location`.
 */
export const arenaNode = (baseUrl: string) => ({
  '@type': 'StadiumOrArena',
  '@id': schemaIds(baseUrl).arena,
  name: ARENA_NAME,
  address: { '@type': 'PostalAddress', ...ARENA_ADDRESS },
})
