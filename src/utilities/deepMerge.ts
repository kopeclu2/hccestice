/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): item is Record<string, unknown> {
  return typeof item === 'object' && item !== null && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export default function deepMerge<T extends object, R extends object>(target: T, source: R): T {
  const output: Record<string, unknown> = { ...(target as Record<string, unknown>) }
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key]
      if (isObject(sourceValue)) {
        if (!(key in target)) {
          output[key] = sourceValue
        } else {
          output[key] = deepMerge(target[key as keyof T] as object, sourceValue)
        }
      } else {
        output[key] = sourceValue
      }
    })
  }

  return output as T
}
