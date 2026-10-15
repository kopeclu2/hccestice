/**
 * Rozvržení sekce „Nadcházející zápasy" podle počtu zápasů a požadovaného
 * režimu (`FixturesRail`). Čistá funkce, aby šla pokrýt testem bez Reactu.
 *
 * - `solo` — jediný zápas: samotný tmavý panel přes celou šířku,
 * - `stacked` — nejbližší zápas v panelu a zbytek pod ním, jako řádky jedné
 *   karty (`display: 'list'`) nebo mřížka malých karet (`'tiles'`),
 * - `rail` — dva zápasy v režimu karet: vodorovný pás.
 */
export type FixturesLayout<T> =
  | { kind: 'empty' }
  | { kind: 'solo'; fixture: T }
  | { kind: 'stacked'; nearest: T; rest: T[]; display: 'list' | 'tiles' }
  | { kind: 'rail'; fixtures: T[] }

export function pickLayout<T>(fixtures: readonly T[], layout: 'cards' | 'list'): FixturesLayout<T> {
  const [nearest, ...rest] = fixtures
  if (nearest === undefined) return { kind: 'empty' }
  if (rest.length === 0) return { kind: 'solo', fixture: nearest }

  // Tři a víc zápasů by v pásu schovaly většinu mimo viditelnou plochu;
  // výpis (`list`) je pod sebe vždy.
  if (rest.length >= 2 || layout === 'list') {
    return { kind: 'stacked', nearest, rest, display: layout === 'list' ? 'list' : 'tiles' }
  }
  return { kind: 'rail', fixtures: [nearest, ...rest] }
}
