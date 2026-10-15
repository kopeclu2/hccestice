/** Drobné pomocníky nad tvarem Payload dokumentů (relace, fallbacky z `content.ts`). */

/** Neprázdné pole z bloku/globalu, jinak fallback z content.ts. */
export const arrayOr = <T, F>(
  rows: T[] | null | undefined,
  fallback: F[],
  map: (row: T) => F,
): F[] => (rows && rows.length > 0 ? rows.map(map) : fallback)

/** Id z relace (populated objekt nebo číslo). */
export const relId = (value: unknown): number | null =>
  typeof value === 'object' && value ? (value as { id: number }).id : ((value as number) ?? null)
