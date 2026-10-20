import { describe, expect, it } from 'vitest'

import { sentryCspReportUri } from '@/lib/csp'

describe('sentryCspReportUri', () => {
  it('skládá bezpečnostní endpoint z DSN', () => {
    expect(sentryCspReportUri('https://abc123@o42.ingest.de.sentry.io/4510')).toBe(
      'https://o42.ingest.de.sentry.io/api/4510/security/?sentry_key=abc123',
    )
  })

  it('zachová port a prefix cesty (self-hosted Sentry)', () => {
    expect(sentryCspReportUri('https://key@sentry.example.cz:9000/sentry/7')).toBe(
      'https://sentry.example.cz:9000/sentry/api/7/security/?sentry_key=key',
    )
  })

  it('tajnou část starého DSN do adresy nepustí', () => {
    expect(sentryCspReportUri('https://pub:secret@host.io/1')).toBe(
      'https://host.io/api/1/security/?sentry_key=pub',
    )
  })

  it('bez DSN, s prázdným nebo rozbitým DSN vrací null', () => {
    expect(sentryCspReportUri(undefined)).toBeNull()
    expect(sentryCspReportUri('')).toBeNull()
    expect(sentryCspReportUri('není-url')).toBeNull()
    expect(sentryCspReportUri('https://host.io/1')).toBeNull()
    expect(sentryCspReportUri('https://key@host.io')).toBeNull()
  })
})
