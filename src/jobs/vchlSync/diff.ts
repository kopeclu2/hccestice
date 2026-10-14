/**
 * Porovnání „co chci mít v DB" s „co v DB je". Zápis smí proběhnout jen při
 * rozdílu — jinak by každý běh přidal záznam do auditního logu, spustil
 * revalidaci a druhý běh nad stejnými daty by nebyl bez změn.
 */

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

/**
 * Převede hodnotu do kanonického tvaru:
 * - `null`, `undefined`, `''` a `false` splývají (checkbox bez hodnoty je
 *   v DB `null`, po uložení `false`; sémanticky je to totéž),
 * - ISO data se zapíšou stejně (`…Z` vs `….000Z`),
 * - řádky polí ztratí `id` (Payload je generuje a při přepsání pole se mění),
 * - klíče objektů se seřadí a prázdné se zahodí.
 */
export function normalize(value: unknown): unknown {
  if (value === undefined || value === null || value === '' || value === false) return null
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') {
    if (ISO_DATETIME.test(value)) {
      const t = new Date(value).getTime()
      if (Number.isFinite(t)) return new Date(t).toISOString()
    }
    return value
  }
  if (Array.isArray(value)) {
    const rows = value.map((row) => {
      if (row && typeof row === 'object' && !Array.isArray(row)) {
        const { id: _id, ...rest } = row as Record<string, unknown>
        void _id
        return normalize(rest)
      }
      return normalize(row)
    })
    return rows.length === 0 ? null : rows
  }
  if (typeof value === 'object') {
    // Populované relace (depth > 0) srovnáváme podle id.
    const o = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(o).sort()) {
      const n = normalize(o[k])
      if (n !== null) out[k] = n
    }
    return Object.keys(out).length === 0 ? null : out
  }
  return value
}

export function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b))
}

export type Patch = {
  /** data pro `payload.update` / `create` — jen změněná pole */
  patch: Record<string, unknown>
  fields: string[]
  before: Record<string, unknown>
  after: Record<string, unknown>
}

/**
 * Projde jen klíče z `desired` (pole, která job nespravuje, se nikdy
 * nedotknou). Prázdný `fields` = shoda = žádný zápis.
 */
export function buildPatch(
  existing: Record<string, unknown> | null | undefined,
  desired: Record<string, unknown>,
): Patch {
  const out: Patch = { patch: {}, fields: [], before: {}, after: {} }
  for (const key of Object.keys(desired)) {
    if (desired[key] === undefined) continue
    if (sameValue(existing?.[key], desired[key])) continue
    out.patch[key] = desired[key]
    out.fields.push(key)
    out.before[key] = existing?.[key] ?? null
    out.after[key] = desired[key]
  }
  return out
}
