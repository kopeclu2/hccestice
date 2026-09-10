const WINDOW_MS = 60_000
const MAX_REQUESTS = 5

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/** Nad touhle hranicí počtu bucketů se při zápisu smažou ty už prošlé. */
const SWEEP_THRESHOLD = 1000

/**
 * In-memory rate limiter podle klíče (typicky IP + endpoint). Postačuje na
 * jediný Node proces, ve kterém aplikace běží (viz AGENTS.md — nasazení je
 * jeden Docker kontejner bez horizontálního škálování); při víc instancích
 * by každá počítala vlastní okno a limit by efektivně násobila.
 *
 * Vrací `true`, když má klíč v aktuálním okně vyčerpaný limit.
 */
export function isRateLimited(
  key: string,
  { windowMs = WINDOW_MS, max = MAX_REQUESTS }: { windowMs?: number; max?: number } = {},
): boolean {
  const now = Date.now()

  if (buckets.size > SWEEP_THRESHOLD) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey)
    }
  }

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  bucket.count += 1
  return bucket.count > max
}

/** Bere první adresu z `x-forwarded-for` (klient), zbytek je proxy řetězec. */
export function getClientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}
