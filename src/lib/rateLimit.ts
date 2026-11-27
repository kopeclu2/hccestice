import { isIP } from 'node:net'

import { isCloudflareIp } from './cloudflareIps'

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

/**
 * IP klienta z hlaviček proxy. Bere **poslední** (nejpravější) neprázdný
 * záznam `x-forwarded-for`, ne první: levé záznamy si klient může
 * v requestu podvrhnout, kdežto pravý připsala nejbližší důvěryhodná proxy.
 *
 * Produkce běží za Traefikem v3 (Coolify) s výchozím nastavením
 * `forwardedHeaders` (klientům nevěří): klientské `x-forwarded-for`
 * zahodí a nastaví skutečnou IP, takže tam je první i poslední záznam
 * totéž. Poslední je robustnější, kdyby se proxy řetěz někdy prodloužil
 * nebo se nastavení Traefiku změnilo. Záloha je `x-real-ip`; bez obou
 * hlaviček (dev, testy) vrací `'unknown'`.
 *
 * Za proxy Cloudflare (od 27. 11. 2026) vidí Traefik jako klienta jen jejich
 * uzel, takže ta adresa by sloučila všechny návštěvníky přes týž uzel do
 * jednoho. Skutečnou IP nese `cf-connecting-ip` — věří se jí **jen tehdy,
 * když přímý peer (výše určená adresa) patří Cloudflare**. Kdo se připojí
 * přímo na IP serveru, Cloudflare není a hlavičku si tak nepodvrhne.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers
    .get('x-forwarded-for')
    ?.split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  const peer = forwarded?.at(-1) || headers.get('x-real-ip')?.trim()

  if (peer && isCloudflareIp(peer)) {
    const visitor = headers.get('cf-connecting-ip')?.trim()
    if (visitor && isIP(visitor) !== 0) return visitor
  }

  return peer || 'unknown'
}
