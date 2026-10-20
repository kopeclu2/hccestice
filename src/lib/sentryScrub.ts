import type { Breadcrumb, Event } from '@sentry/nextjs'

/**
 * Čištění dat před odesláním do Sentry (`beforeSend`, `beforeSendTransaction`,
 * `beforeBreadcrumb`). Izomorfní — běží na serveru, v Edge i v prohlížeči;
 * Sentry se importuje jen jako typ.
 *
 * Proč: URL requestu nese `?previewSecret=` (vstup do náhledu konceptů),
 * `/admin/reset/<token>` (odkaz pro obnovu hesla = převzetí účtu) a hlavičky
 * `Authorization` / `Cookie` (JWT správce). Sentry je třetí strana a události
 * z něj čtou i lidé, kteří do adminu nepatří.
 */

export const REDACTED = '[Filtered]'

/** Query parametry, jejichž hodnota se nikdy neodesílá (porovnává se bez ohledu na velikost písmen). */
const SENSITIVE_PARAM =
  /^(?:previewsecret|secret|password|pass|key|code|auth|authorization|apikey|api_key|api-key|[a-z_-]*token)$/i

/** Hlavičky, které se z události mažou celé. */
const SENSITIVE_HEADER =
  /^(?:authorization|proxy-authorization|cookie|set-cookie|x-api-key|x-csrf-token|x-payload-token)$/i

/**
 * Adresa bez tajemství: hodnoty citlivých query parametrů a token v cestě
 * `/admin/reset/<token>`. Pracuje s řetězcem, ne s `URL` — Sentry občas
 * posílá relativní nebo ořezané adresy, které by `new URL` odmítlo.
 */
export function scrubUrl(url: string): string {
  return url
    .replace(/([?&;#])([^=&#;\s]+)=([^&#;\s]*)/g, (match, sep: string, name: string) =>
      SENSITIVE_PARAM.test(safeDecode(name)) ? `${sep}${name}=${REDACTED}` : match,
    )
    .replace(/(\/reset\/)[^/?#\s]+/gi, `$1${REDACTED}`)
}

/** `decodeURIComponent`, který na neplatném kódování nehází (`%zz` v URL od skeneru). */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function scrubHeaders(headers: Record<string, unknown> | undefined): void {
  if (!headers) return
  for (const name of Object.keys(headers)) {
    if (SENSITIVE_HEADER.test(name)) delete headers[name]
    else if (
      typeof headers[name] === 'string' &&
      /^(?:referer|referrer|location|origin)$/i.test(name)
    ) {
      headers[name] = scrubUrl(headers[name])
    }
  }
}

/** Query string z `request.query_string` — řetězec, objekt nebo pole dvojic. */
function scrubQueryString(query: unknown): unknown {
  if (typeof query === 'string') return scrubUrl(`?${query.replace(/^\?/, '')}`).slice(1)
  if (Array.isArray(query)) {
    return query.map((pair) =>
      Array.isArray(pair) && typeof pair[0] === 'string' && SENSITIVE_PARAM.test(pair[0])
        ? [pair[0], REDACTED]
        : pair,
    )
  }
  if (query && typeof query === 'object') {
    return Object.fromEntries(
      Object.entries(query).map(([name, value]) => [
        name,
        SENSITIVE_PARAM.test(name) ? REDACTED : value,
      ]),
    )
  }
  return query
}

/** Přepíše hodnoty typu řetězec (adresy) v plochém objektu `data` spanu / breadcrumbu. */
function scrubDataUrls(data: Record<string, unknown> | undefined): void {
  if (!data) return
  for (const [name, value] of Object.entries(data)) {
    if (typeof value !== 'string') continue
    if (name === 'http.query' || name === 'url.query') {
      data[name] = scrubUrl(`?${value.replace(/^\?/, '')}`).slice(1)
    } else if (
      /(?:^|[._])(?:url|from|to|href|referrer)$/i.test(name) ||
      value.includes('?') ||
      /\/reset\//i.test(value)
    ) {
      data[name] = scrubUrl(value)
    }
  }
}

/** Společná část pro chybové události i transakce. */
function scrubCommon<T extends Event>(event: T): T {
  const { request } = event
  if (request) {
    if (typeof request.url === 'string') request.url = scrubUrl(request.url)
    if (request.query_string !== undefined) {
      request.query_string = scrubQueryString(request.query_string) as typeof request.query_string
    }
    scrubHeaders(request.headers)
    // `Cookie` hlavičku Sentry často přepíše do `request.cookies`.
    delete request.cookies
  }

  if (typeof event.transaction === 'string') event.transaction = scrubUrl(event.transaction)

  for (const breadcrumb of event.breadcrumbs ?? []) scrubBreadcrumb(breadcrumb)

  const traceData = event.contexts?.trace?.data
  if (traceData) scrubDataUrls(traceData as Record<string, unknown>)

  return event
}

/** `beforeSend` — chybové události. */
export function scrubEvent<T extends Event>(event: T): T {
  return scrubCommon(event)
}

/** `beforeSendTransaction` — transakce včetně spanů (adresy HTTP volání). */
export function scrubTransaction<T extends Event>(event: T): T {
  scrubCommon(event)
  for (const span of event.spans ?? []) {
    if (typeof span.description === 'string') span.description = scrubUrl(span.description)
    scrubDataUrls(span.data as Record<string, unknown> | undefined)
  }
  return event
}

/** `beforeBreadcrumb` — navigace (`from`/`to`) a `fetch`/`xhr` (`url`). */
export function scrubBreadcrumb<T extends Breadcrumb>(breadcrumb: T): T {
  if (typeof breadcrumb.message === 'string') breadcrumb.message = scrubUrl(breadcrumb.message)
  scrubDataUrls(breadcrumb.data as Record<string, unknown> | undefined)
  return breadcrumb
}
