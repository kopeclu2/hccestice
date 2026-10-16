/** Drobné pomocníky nad tvarem Payload dokumentů (relace, fallbacky z `content.ts`). */

/** Neprázdné pole z bloku/globalu, jinak fallback z content.ts. */
export const arrayOr = <T, F>(
  rows: T[] | null | undefined,
  fallback: F[],
  map: (row: T) => F,
): F[] => (rows && rows.length > 0 ? rows.map(map) : fallback)

/** Id z relace (populated objekt nebo číslo), `null` pro prázdnou relaci. */
export const relId = (value: unknown): number | null => {
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value && 'id' in value && typeof value.id === 'number') {
    return value.id
  }
  return null
}
