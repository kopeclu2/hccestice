import { beforeEach, describe, expect, it, vi } from 'vitest'

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }))

import { applyRevalidation, createRevalidateHooks } from '@/hooks/createRevalidateHooks'
import {
  revalidateGalleryFeeds,
  revalidateGalleryFeedsDelete,
} from '@/hooks/revalidateGalleryFeeds'
import { CACHE_TAGS, documentTag, LANDING_CACHE_TAGS } from '@/landing/data/tags'

const info = vi.fn()

const args = (doc: unknown, context: Record<string, unknown> = {}, previousDoc?: unknown) =>
  ({ doc, previousDoc, req: { payload: { logger: { info } }, context } }) as never

beforeEach(() => {
  revalidatePath.mockReset()
  revalidateTag.mockReset()
  info.mockReset()
})

describe('createRevalidateHooks', () => {
  it('redakční profil { expire: 0 } a log (revalidateNavigation, revalidateMaintenance)', () => {
    const { afterChange, afterDelete } = createRevalidateHooks({
      label: 'navigaci',
      tags: [CACHE_TAGS.navigation],
      profile: { expire: 0 },
    })
    const doc = { id: 1 }

    expect(afterChange(args(doc))).toBe(doc)
    expect(revalidateTag).toHaveBeenCalledWith('navigation', { expire: 0 })
    expect(info).toHaveBeenCalledWith('Revaliduji navigaci (tagy: navigation)')

    revalidateTag.mockClear()
    expect(afterDelete(args(doc))).toBe(doc)
    expect(revalidateTag).toHaveBeenCalledWith('navigation', { expire: 0 })
  })

  it('profil max pro crawlerské feedy (revalidateRedirects, MatchFeeds)', () => {
    const { afterChange } = createRevalidateHooks({
      label: 'přesměrování',
      tags: [CACHE_TAGS.redirects],
      profile: 'max',
    })
    afterChange(args({}))
    expect(revalidateTag).toHaveBeenCalledWith('redirects', 'max')
  })

  it('context.disableRevalidate nevolá nic, doc se vrací', () => {
    const { afterChange, afterDelete } = createRevalidateHooks({
      label: 'x',
      tags: [CACHE_TAGS.matches],
      profile: 'max',
      paths: () => ['/a'],
    })
    const doc = { id: 1 }

    expect(afterChange(args(doc, { disableRevalidate: true }))).toBe(doc)
    expect(afterDelete(args(doc, { disableRevalidate: true }))).toBe(doc)
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(info).not.toHaveBeenCalled()
  })

  it('feeds se vždy invalidují profilem max vedle redakčního profilu (revalidatePost)', () => {
    const { afterChange } = createRevalidateHooks({
      label: 'články',
      tags: [CACHE_TAGS.posts],
      profile: { expire: 0 },
      feeds: [CACHE_TAGS.postsSitemap, CACHE_TAGS.llmsTxt],
    })
    afterChange(args({}))
    expect(revalidateTag.mock.calls).toEqual([
      ['posts-list', { expire: 0 }],
      ['posts-sitemap', 'max'],
      ['llms-txt', 'max'],
    ])
  })

  it('paths dostane doc a previousDoc; cesty se revalidují před tagy (revalidateLanding)', () => {
    const paths = vi.fn((doc: { slug: string }, previous?: { slug: string }) => [
      `/aktuality/${doc.slug}`,
      ...(previous ? [`/aktuality/${previous.slug}`] : []),
    ])
    const { afterChange, afterDelete } = createRevalidateHooks({
      label: 'článek',
      tags: [CACHE_TAGS.posts],
      profile: { expire: 0 },
      paths,
    })

    afterChange(args({ slug: 'novy' }, {}, { slug: 'stary' }))
    expect(revalidatePath.mock.calls).toEqual([['/aktuality/novy'], ['/aktuality/stary']])
    expect(paths).toHaveBeenCalledWith({ slug: 'novy' }, { slug: 'stary' })

    revalidatePath.mockClear()
    afterDelete(args({ slug: 'smazany' }))
    expect(revalidatePath.mock.calls).toEqual([['/aktuality/smazany']])
    expect(paths).toHaveBeenLastCalledWith({ slug: 'smazany' })
  })

  it('skipDrafts přeskočí koncept, publikovaný projde', () => {
    const { afterChange } = createRevalidateHooks({
      label: 'landing',
      tags: LANDING_CACHE_TAGS,
      profile: { expire: 0 },
      skipDrafts: true,
    })

    afterChange(args({ _status: 'draft' }))
    expect(revalidateTag).not.toHaveBeenCalled()

    afterChange(args({ _status: 'published' }))
    afterChange(args({ id: 1 })) // global bez _status
    expect(revalidateTag).toHaveBeenCalledTimes(LANDING_CACHE_TAGS.length * 2)
  })

  it('bez skipDrafts se koncept revaliduje (feedy, navigace)', () => {
    const { afterChange } = createRevalidateHooks({
      label: 'x',
      tags: [CACHE_TAGS.navigation],
      profile: { expire: 0 },
    })
    afterChange(args({ _status: 'draft' }))
    expect(revalidateTag).toHaveBeenCalledTimes(1)
  })
})

describe('applyRevalidation', () => {
  it('cesty, tagy a feedy v jedné dávce, s logem', () => {
    applyRevalidation(
      { info },
      {
        label: 'landing stránky',
        paths: ['/', '/soupiska'],
        tags: LANDING_CACHE_TAGS,
        profile: { expire: 0 },
      },
    )
    expect(revalidatePath.mock.calls).toEqual([['/'], ['/soupiska']])
    expect(revalidateTag.mock.calls.map(([tag]) => tag)).toEqual([
      'site-config',
      'posts-list',
      'galleries-list',
      'matches-list',
    ])
    expect(info).toHaveBeenCalledTimes(1)
    expect(info.mock.calls[0][0]).toContain('/soupiska')
  })
})

describe('revalidateGalleryFeeds (převedený hook)', () => {
  it('invaliduje gallery-sitemap a llms-txt profilem max, jako dřív', () => {
    const doc = { id: 1 }
    expect(revalidateGalleryFeeds(args(doc))).toBe(doc)
    expect(revalidateGalleryFeedsDelete(args(doc))).toBe(doc)
    expect(revalidateTag.mock.calls).toEqual([
      ['gallery-sitemap', 'max'],
      ['llms-txt', 'max'],
      ['gallery-sitemap', 'max'],
      ['llms-txt', 'max'],
    ])
  })

  it('respektuje disableRevalidate', () => {
    revalidateGalleryFeeds(args({}, { disableRevalidate: true }))
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe('CACHE_TAGS', () => {
  it('obsahuje všechny dosud literálové tagy', () => {
    expect(Object.values(CACHE_TAGS).sort()).toEqual(
      [
        'site-config',
        'posts-list',
        'galleries-list',
        'matches-list',
        'navigation',
        'maintenance',
        'redirects',
        'llms-txt',
        'posts-sitemap',
        'pages-sitemap',
        'gallery-sitemap',
        'matches-sitemap',
        'global_header',
        'global_footer',
      ].sort(),
    )
  })

  it('LANDING_CACHE_TAGS se nezměnily', () => {
    expect([...LANDING_CACHE_TAGS]).toEqual([
      'site-config',
      'posts-list',
      'galleries-list',
      'matches-list',
    ])
  })

  it('documentTag = formát z getDocument', () => {
    expect(documentTag('pages', 'home')).toBe('pages_home')
  })
})
