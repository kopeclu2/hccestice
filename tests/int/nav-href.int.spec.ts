import { describe, expect, it } from 'vitest'

import { ctaHref, isNavItemActive, navHref } from '@/landing/features/navigation/navHref'
import type { NavItem } from '@/landing/features/navigation/types'

const both: NavItem = { label: 'Aktuality', anchor: 'aktuality', path: '/aktuality' }
const anchorOnly: NavItem = { label: 'Klub', anchor: 'klub', path: null }
const pathOnly: NavItem = { label: 'Zápasy', anchor: null, path: '/zapasy' }
const empty: NavItem = { label: 'Nic', anchor: null, path: null }

describe('navHref', () => {
  it('na home vede kotva, pokud sekce existuje', () => {
    expect(navHref(both, 'home')).toBe('#aktuality')
    expect(navHref(anchorOnly, 'home')).toBe('#klub')
  })

  it('na home bez sekce vede na podstránku', () => {
    expect(navHref(pathOnly, 'home')).toBe('/zapasy')
  })

  it('na podstránce vede cesta, pokud ji položka má', () => {
    expect(navHref(both, 'subpage')).toBe('/aktuality')
    expect(navHref(pathOnly, 'subpage')).toBe('/zapasy')
  })

  it('na podstránce bez cesty vede absolutní kotva na homepage', () => {
    expect(navHref(anchorOnly, 'subpage')).toBe('/#klub')
  })

  it('prázdná položka nespadne: home → /, podstránka → /#', () => {
    expect(navHref(empty, 'home')).toBe('/')
    expect(navHref(empty, 'subpage')).toBe('/#')
  })
})

describe('isNavItemActive', () => {
  it('shoda cesty i detail pod ní', () => {
    expect(isNavItemActive(both, '/aktuality')).toBe(true)
    expect(isNavItemActive(both, '/aktuality/treninky')).toBe(true)
  })

  it('prefix musí končit na hranici segmentu', () => {
    expect(isNavItemActive(both, '/aktuality-archiv')).toBe(false)
    expect(isNavItemActive(pathOnly, '/zapasy2')).toBe(false)
  })

  it('jiná cesta aktivní není', () => {
    expect(isNavItemActive(both, '/zapasy')).toBe(false)
    expect(isNavItemActive(both, '/')).toBe(false)
  })

  it('položka bez cesty (jen kotva) není aktivní nikdy', () => {
    expect(isNavItemActive(anchorOnly, '/')).toBe(false)
    expect(isNavItemActive(anchorOnly, '/klub')).toBe(false)
    expect(isNavItemActive(empty, '/cokoliv')).toBe(false)
  })
})

describe('ctaHref', () => {
  it('kotva se na podstránce doplní na absolutní, na home zůstane', () => {
    expect(ctaHref('#kontakt', 'subpage')).toBe('/#kontakt')
    expect(ctaHref('#kontakt', 'home')).toBe('#kontakt')
  })

  it('cesta se nemění v žádném kontextu', () => {
    expect(ctaHref('/zapasy', 'subpage')).toBe('/zapasy')
    expect(ctaHref('/zapasy', 'home')).toBe('/zapasy')
  })
})
