/**
 * Rozhodování brány režimu údržby — čistá logika bez Nextu, aby šla
 * otestovat a sdílet mezi `src/proxy.ts` a interní routou.
 *
 * Brána žije v proxy, ne v root layoutu: layout se u prerenderovaných
 * stránek nespouští na každém requestu, a když ho ISR regenerace spustila
 * se zapnutým režimem, ověření přihlášení (`headers()`) shodilo stránku na
 * „Page changed from static to dynamic at runtime“ → HTTP 500 místo
 * údržbové stránky (16. 10. 2026, produkce).
 */

/** Cookie Payloadu s JWT přihlášeného uživatele (`cookiePrefix` je výchozí). */
export const PAYLOAD_TOKEN_COOKIE = 'payload-token'

/**
 * Cookie, kterou proxy nastaví tomu, kdo bránou prošel. Není `httpOnly`:
 * čte ji `MaintenanceNotice` na klientu, protože layout prerenderovaných
 * stránek nemá jak poznat, kdo se dívá.
 */
export const MAINTENANCE_BYPASS_COOKIE = 'hc-maintenance-bypass'

/** Za jak dlouho se má crawler vrátit (sekundy, hlavička `Retry-After`). */
export const MAINTENANCE_RETRY_AFTER = 600

/**
 * Cesty, které brána nikdy nezavírá: administrace a její API, interní
 * routy (odsud si proxy čte stav), náhled konceptů, healthcheck Coolify
 * a samotná údržbová stránka, kterou proxy servíruje.
 */
const OPEN_PREFIXES = ['/admin', '/api', '/internal', '/next', '/health', '/udrzba', '/_next']

export function isGatedPath(pathname: string): boolean {
  return !OPEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export type MaintenanceDecision = 'pass' | 'bypass' | 'block'

/**
 * - `pass` — režim je vypnutý, request jde dál beze změny.
 * - `bypass` — režim je zapnutý, ale přihlášený správce web vidět musí;
 *   proxy mu nastaví cookie pro lištu „Režim údržby je zapnutý“. Náhled
 *   konceptu zvlášť povolovat netřeba: otevírá ho z adminu přihlášený
 *   správce, a cookie draft módu by šla podvrhnout.
 * - `block` — návštěvník dostane údržbovou stránku s HTTP 503.
 */
export function decideMaintenance({
  enabled,
  authenticated,
}: {
  enabled: boolean
  authenticated: boolean
}): MaintenanceDecision {
  if (!enabled) return 'pass'
  return authenticated ? 'bypass' : 'block'
}
