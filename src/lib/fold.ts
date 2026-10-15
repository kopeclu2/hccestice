/**
 * Normalizace textu pro porovnávání a slugy: bez diakritiky, malá písmena.
 *
 * **Záměrně bez importů.** `src/ahl/ourTeam.ts` se sdílí s frontendem, takže
 * se sem nesmí dostat nic serverového. Dřív to byla sedmkrát opsaná řádka
 * (`ahl/*`, `plainText`, `foldTeam`, `slugifyCs`), která se lišila jen tím,
 * co se dělá po odstranění diakritiky.
 */

export type FoldOptions = {
  /** Řady bílých znaků (i nedělitelná mezera) na jednu mezeru a ořez okrajů. */
  collapseSpaces?: boolean
  /** Každá řada znaků mimo `a-z0-9` na jednu mezeru a ořez okrajů (klíč týmu). */
  alnumOnly?: boolean
}

/**
 * Bez diakritiky (NFD + odstranění kombinujících značek) a malými písmeny.
 * Bez voleb je to jen tohle; `collapseSpaces` a `alnumOnly` přidávají čištění
 * mezer. `alnumOnly` mezery sloučí taky, takže `collapseSpaces` s ním
 * nic navíc nedělá.
 */
export function fold(s: string, opts: FoldOptions = {}): string {
  const base = s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  if (opts.alnumOnly) return base.replace(/[^a-z0-9]+/g, ' ').trim()
  if (opts.collapseSpaces) return base.replace(/\s+/g, ' ').trim()
  return base
}
