import { deepMergeWithSourceArrays } from 'payload/shared'

/**
 * Hluboké sloučení konfigurace polí (`link`, `linkGroup`): hodnoty ze `source`
 * přebíjejí `target`, **pole se nahrazují**, ne spojují — override `fields`
 * má pole nahradit, ne připojit za výchozí.
 */
export default function deepMerge<T extends object>(target: T, source: object): T {
  return deepMergeWithSourceArrays<T>(target, source)
}
