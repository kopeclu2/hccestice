import { describe, expect, it } from 'vitest'

import { buildPageMetadata } from '@/lib/buildPageMetadata'
import { getServerSideURL } from '@/lib/getURL'

describe('buildPageMetadata', () => {
  const base = { title: 'Soupiska', description: 'Kdo hraje.', path: '/soupiska' }

  it('og:url je absolutní a shodné s canonicalem, title má značku', () => {
    const meta = buildPageMetadata(base)
    expect(meta.title).toBe('Soupiska | HC Čestice')
    expect(meta.alternates?.canonical).toBe('/soupiska')
    expect(meta.openGraph?.url).toBe(`${getServerSideURL()}/soupiska`)
    expect(meta.openGraph?.title).toBe('Soupiska | HC Čestice')
    expect(meta.openGraph?.description).toBe('Kdo hraje.')
  })

  it('značku nezdvojí', () => {
    expect(buildPageMetadata({ ...base, title: 'Zápasy | HC Čestice' }).title).toBe(
      'Zápasy | HC Čestice',
    )
  })

  it('twitter je vlastní summary_large_image s titulkem stránky', () => {
    const meta = buildPageMetadata(base)
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Soupiska | HC Čestice',
      description: 'Kdo hraje.',
    })
  })

  it('obrázek: bez něj logo klubu, cesta se doplní o doménu, absolutní URL zůstane', () => {
    const logo = buildPageMetadata(base).openGraph?.images
    expect(logo).toEqual([{ url: `${getServerSideURL()}/logo-cestice.png` }])
    expect(buildPageMetadata({ ...base, image: '/media/a.jpg' }).openGraph?.images).toEqual([
      { url: `${getServerSideURL()}/media/a.jpg` },
    ])
    expect(
      buildPageMetadata({ ...base, image: 'https://cdn.example/a.jpg' }).openGraph?.images,
    ).toEqual([{ url: 'https://cdn.example/a.jpg' }])
  })

  it('robots jen když se předá; parametry výpisu zůstanou v canonicalu i og:url', () => {
    expect(buildPageMetadata(base)).not.toHaveProperty('robots')
    const meta = buildPageMetadata({
      ...base,
      path: '/aktuality?page=2',
      robots: { follow: true, index: false },
    })
    expect(meta.robots).toEqual({ follow: true, index: false })
    expect(meta.alternates?.canonical).toBe('/aktuality?page=2')
    expect(meta.openGraph?.url).toBe(`${getServerSideURL()}/aktuality?page=2`)
  })
})
