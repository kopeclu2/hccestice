import { describe, expect, it } from 'vitest'

import { decideMaintenance, isGatedPath } from '@/lib/maintenanceGate'

describe('decideMaintenance', () => {
  it('vypnutý režim pouští všechny beze změny', () => {
    expect(decideMaintenance({ enabled: false, authenticated: false })).toBe('pass')
    expect(decideMaintenance({ enabled: false, authenticated: true })).toBe('pass')
  })

  it('zapnutý režim zavře web návštěvníkovi', () => {
    expect(decideMaintenance({ enabled: true, authenticated: false })).toBe('block')
  })

  it('přihlášený správce projde', () => {
    expect(decideMaintenance({ enabled: true, authenticated: true })).toBe('bypass')
  })
})

describe('isGatedPath', () => {
  it.each(['/', '/zapasy', '/zapasy/2026-10-10-hc-policka-b', '/aktuality/clanek', '/kontakty'])(
    'veřejná stránka %s je za bránou',
    (path) => expect(isGatedPath(path)).toBe(true),
  )

  it.each([
    '/admin',
    '/admin/globals/siteConfig',
    '/api/users/login',
    '/internal/maintenance',
    '/next/preview',
    '/health',
    '/udrzba',
    '/_next/static/chunk.js',
  ])('%s brána nezavírá', (path) => expect(isGatedPath(path)).toBe(false))

  it('neplete si prefix s podobnou cestou', () => {
    expect(isGatedPath('/administrace')).toBe(true)
    expect(isGatedPath('/udrzbar')).toBe(true)
  })
})
