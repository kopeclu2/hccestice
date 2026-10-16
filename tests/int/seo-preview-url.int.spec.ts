import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { seoPreviewUrl } from '@/lib/seoPreviewUrl'

describe('seoPreviewUrl', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://example.cz')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('článek vede na /aktuality/{slug}, ne na /{slug}', () => {
    expect(seoPreviewUrl({ collectionSlug: 'posts', slug: 'treninky' })).toBe(
      'https://example.cz/aktuality/treninky',
    )
  })

  it('stránka žije na /{slug}', () => {
    expect(seoPreviewUrl({ collectionSlug: 'pages', slug: 'kontakty' })).toBe(
      'https://example.cz/kontakty',
    )
  })

  it('domovská stránka je /, ne /home', () => {
    expect(seoPreviewUrl({ collectionSlug: 'pages', slug: 'home' })).toBe('https://example.cz/')
  })

  it('kolekci vezme i z collectionConfig, když collectionSlug chybí', () => {
    expect(seoPreviewUrl({ collectionConfig: { slug: 'posts' }, slug: 'a' })).toBe(
      'https://example.cz/aktuality/a',
    )
  })

  it('bez kolekce se chová jako stránka', () => {
    expect(seoPreviewUrl({ slug: 'historie-klubu' })).toBe('https://example.cz/historie-klubu')
  })

  it('bez slugu vrací jen adresu webu', () => {
    expect(seoPreviewUrl({ collectionSlug: 'posts', slug: undefined })).toBe('https://example.cz')
    expect(seoPreviewUrl({ collectionSlug: 'posts', slug: '' })).toBe('https://example.cz')
  })
})
