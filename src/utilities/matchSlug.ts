/**
 * Slug zápasu = adresa detailu `/zapasy/<slug>`, např. `2025-10-12-hc-zdar`.
 * Čisté funkce bez přístupu k databázi; hook je v `hooks/matchSlug.ts`.
 *
 * Formát musí sedět s SQL backfillem v migraci `…_match_slug`
 * (`YYYY-MM-DD-<opponents.slug>`, kolize `-2`, `-3`…).
 */

/** `YYYY-MM-DD-<slug soupeře>`; bez soupeře jen den. */
export function matchSlug(day: string, opponentSlug: string | null | undefined): string {
  return opponentSlug ? `${day}-${opponentSlug}` : day
}

/** První výskyt je bez přípony, další `-2`, `-3`… (`n` počítáno od 1). */
export function withSlugSuffix(base: string, n: number): string {
  return n <= 1 ? base : `${base}-${n}`
}

/** Strop pokusů — pojistka proti nekonečné smyčce při rozbitém `isTaken`. */
const MAX_ATTEMPTS = 1000

/**
 * Najde první volný slug z řady `base`, `base-2`, `base-3`…
 * `isTaken` je injektované, aby šla logika testovat bez databáze.
 */
export async function uniqueSlug(base: string, isTaken: (slug: string) => Promise<boolean>): Promise<string> {
  for (let n = 1; n <= MAX_ATTEMPTS; n++) {
    const candidate = withSlugSuffix(base, n)
    if (!(await isTaken(candidate))) return candidate
  }
  throw new Error(`Nepodařilo se najít volný slug pro „${base}" (${MAX_ATTEMPTS} pokusů).`)
}
