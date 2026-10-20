/**
 * Adresa, kam prohlížeč hlásí porušení Content-Security-Policy: bezpečnostní
 * endpoint Sentry projektu, odvozený z DSN.
 *
 * DSN má tvar `https://<publicKey>[:<secret>]@<host>[/<prefix>]/<projectId>`,
 * endpoint `https://<host>[/<prefix>]/api/<projectId>/security/?sentry_key=<publicKey>`.
 * Tajná část starých DSN se do adresy nedostane — report-uri je veřejná.
 *
 * Bez DSN nebo s rozbitým DSN vrací `null` a direktiva `report-uri` se
 * vynechá; chybná env proměnná nesmí shodit `next build`.
 */
export function sentryCspReportUri(dsn: string | undefined): string | null {
  if (!dsn) return null

  let url: URL
  try {
    url = new URL(dsn)
  } catch {
    return null
  }

  const segments = url.pathname.split('/').filter(Boolean)
  const projectId = segments.pop()
  if (!url.username || !projectId) return null

  const prefix = segments.length > 0 ? `/${segments.join('/')}` : ''

  return `${url.protocol}//${url.host}${prefix}/api/${projectId}/security/?sentry_key=${url.username}`
}
