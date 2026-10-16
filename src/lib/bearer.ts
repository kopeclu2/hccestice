import { timingSafeEqual } from 'node:crypto'

/**
 * Porovnání tajemství v konstantním čase. `===` na řetězcích končí
 * u prvního rozdílného znaku, takže by z doby odpovědi šlo tajemství
 * po znacích uhodnout. `timingSafeEqual` vyžaduje stejně dlouhé buffery,
 * proto se délky porovnávají zvlášť (délka tajemství není utajovaná).
 */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

/**
 * Ověří hlavičku `Authorization: Bearer <secret>`. Bez nastaveného
 * tajemství vrací vždy `false` — prázdný secret by jinak propustil
 * `Bearer ` bez hodnoty.
 *
 * Modul je záměrně bez `server-only`: importuje ho `payload.config.ts`
 * (viz „`server-only`" v AGENTS.md).
 */
export function hasBearerSecret(
  header: string | null | undefined,
  secret: string | undefined,
): boolean {
  if (!secret || !header) return false
  return safeEqual(header, `Bearer ${secret}`)
}
