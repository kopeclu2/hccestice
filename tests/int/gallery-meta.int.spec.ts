import { describe, expect, it } from 'vitest'

import {
  galleryDescription,
  galleryTitle,
  PHOTO_FORMS,
  titleFromSlug,
} from '@/landing/features/galleries/view/galleryMeta'
import { countLabel, plural } from '@/lib/plural'

describe('skloňování počtu fotek', () => {
  it('1 fotka / 2–4 fotky / 5+ a 0 fotek', () => {
    expect(countLabel(1, PHOTO_FORMS)).toBe('1 fotka')
    expect(countLabel(2, PHOTO_FORMS)).toBe('2 fotky')
    expect(countLabel(3, PHOTO_FORMS)).toBe('3 fotky')
    expect(countLabel(4, PHOTO_FORMS)).toBe('4 fotky')
    expect(countLabel(5, PHOTO_FORMS)).toBe('5 fotek')
    expect(countLabel(11, PHOTO_FORMS)).toBe('11 fotek')
    expect(countLabel(22, PHOTO_FORMS)).toBe('22 fotek') // česky nejde o ruské pravidlo
    expect(countLabel(0, PHOTO_FORMS)).toBe('0 fotek')
    expect(plural(101, PHOTO_FORMS)).toBe('fotek')
  })
})

describe('titleFromSlug a galleryTitle', () => {
  it('slug → čitelný název', () => {
    expect(titleFromSlug('turnaj-pardubice-2025')).toBe('Turnaj pardubice 2025')
    expect(titleFromSlug('zimni_stadion')).toBe('Zimni stadion')
    expect(titleFromSlug('')).toBe('')
  })

  it('vlastní titulek má přednost', () => {
    expect(galleryTitle('Turnaj v Pardubicích', 'turnaj-pardubice')).toBe('Turnaj v Pardubicích')
  })

  it('prázdný titulek nebo titulek shodný se slugem se odvodí ze slugu', () => {
    expect(galleryTitle('', 'turnaj-pardubice')).toBe('Turnaj pardubice')
    expect(galleryTitle('   ', 'turnaj-pardubice')).toBe('Turnaj pardubice')
    expect(galleryTitle(null, 'turnaj-pardubice')).toBe('Turnaj pardubice')
    expect(galleryTitle('turnaj-pardubice', 'turnaj-pardubice')).toBe('Turnaj pardubice')
  })
})

describe('galleryDescription', () => {
  it('skloňuje počet a doplní datum v genitivu', () => {
    const date = '2026-03-08T12:00:00.000Z'
    expect(galleryDescription({ title: 'Turnaj', photoCount: 3, date })).toBe(
      'Fotogalerie Turnaj z 8. března 2026 — 3 fotky.',
    )
    expect(galleryDescription({ title: 'Turnaj', photoCount: 1, date })).toBe(
      'Fotogalerie Turnaj z 8. března 2026 — 1 fotka.',
    )
    expect(galleryDescription({ title: 'Turnaj', photoCount: 12, date })).toBe(
      'Fotogalerie Turnaj z 8. března 2026 — 12 fotek.',
    )
  })

  it('bez data věta bez něj, neplatné datum se ignoruje', () => {
    expect(galleryDescription({ title: 'Zimní stadion', photoCount: 5 })).toBe(
      'Fotogalerie Zimní stadion — 5 fotek.',
    )
    expect(galleryDescription({ title: 'X', photoCount: 2, date: 'blbost' })).toBe(
      'Fotogalerie X — 2 fotky.',
    )
  })
})
