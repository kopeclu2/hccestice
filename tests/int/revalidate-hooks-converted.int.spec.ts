import { beforeEach, describe, expect, it, vi } from 'vitest'

const { revalidatePath, revalidateTag, pingIndexNow } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  pingIndexNow: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }))
vi.mock('@/lib/indexNow', () => ({ pingIndexNow }))

import {
  revalidateDelete as revalidatePageDelete,
  revalidatePage,
} from '@/collections/Pages/hooks/revalidatePage'
import {
  revalidateDelete as revalidatePostDelete,
  revalidatePost,
} from '@/collections/Posts/hooks/revalidatePost'
import { revalidateFooter } from '@/Footer/hooks/revalidateFooter'
import { revalidateHeader } from '@/Header/hooks/revalidateHeader'
import { revalidateLanding, revalidateLandingDelete } from '@/hooks/revalidateLanding'
import { revalidateMaintenance } from '@/hooks/revalidateMaintenance'
import { revalidateMatchFeeds, revalidateMatchFeedsDelete } from '@/hooks/revalidateMatchFeeds'
import { revalidateNavigation, revalidateNavigationDelete } from '@/hooks/revalidateNavigation'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'

const info = vi.fn()

const args = (doc: unknown, context: Record<string, unknown> = {}, previousDoc?: unknown) =>
  ({
    doc,
    previousDoc,
    req: { payload: { logger: { info, warn: vi.fn() } }, context },
  }) as never

const tagCalls = () => revalidateTag.mock.calls
const pathCalls = () => revalidatePath.mock.calls.map(([path]) => path)

beforeEach(() => {
  revalidatePath.mockReset()
  revalidateTag.mockReset()
  pingIndexNow.mockReset()
  info.mockReset()
})

describe('redakční hooky s profilem { expire: 0 }', () => {
  it('navigace: afterChange i afterDelete', () => {
    const doc = { id: 1 }
    expect(revalidateNavigation(args(doc))).toBe(doc)
    expect(revalidateNavigationDelete(args(doc))).toBe(doc)
    expect(tagCalls()).toEqual([
      ['navigation', { expire: 0 }],
      ['navigation', { expire: 0 }],
    ])
  })

  it('údržba: global afterChange, disableRevalidate nic nevolá', () => {
    revalidateMaintenance(args({}))
    expect(tagCalls()).toEqual([['maintenance', { expire: 0 }]])

    revalidateTag.mockClear()
    revalidateMaintenance(args({}, { disableRevalidate: true }))
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe('crawlerské feedy s profilem max', () => {
  it('sitemapa zápasů: afterChange i afterDelete', () => {
    const doc = { id: 1 }
    expect(revalidateMatchFeeds(args(doc))).toBe(doc)
    expect(revalidateMatchFeedsDelete(args(doc))).toBe(doc)
    expect(tagCalls()).toEqual([
      ['matches-sitemap', 'max'],
      ['matches-sitemap', 'max'],
    ])
    revalidateTag.mockClear()
    revalidateMatchFeeds(args(doc, { disableRevalidate: true }))
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('přesměrování', () => {
    revalidateRedirects(args({}))
    expect(tagCalls()).toEqual([['redirects', 'max']])
    revalidateTag.mockClear()
    revalidateRedirects(args({}, { disableRevalidate: true }))
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('hlavička a patička (globaly)', () => {
    revalidateHeader(args({}))
    revalidateFooter(args({}))
    expect(tagCalls()).toEqual([
      ['global_header', 'max'],
      ['global_footer', 'max'],
    ])
  })
})

describe('revalidateLanding', () => {
  it('cesty, pak všechny landing tagy profilem { expire: 0 }', () => {
    revalidateLanding(args({ id: 1 }))
    expect(pathCalls()).toEqual(['/', '/historie-klubu', '/soupiska', '/sponzori'])
    expect(tagCalls()).toEqual([
      ['site-config', { expire: 0 }],
      ['posts-list', { expire: 0 }],
      ['galleries-list', { expire: 0 }],
      ['matches-list', { expire: 0 }],
    ])
  })

  it('koncept (autosave) se přeskočí, afterDelete taky respektuje koncept i kontext', () => {
    revalidateLanding(args({ _status: 'draft' }))
    revalidateLandingDelete(args({ _status: 'draft' }))
    revalidateLanding(args({ id: 1 }, { disableRevalidate: true }))
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()

    revalidateLandingDelete(args({ _status: 'published' }))
    expect(revalidateTag).toHaveBeenCalledTimes(4)
  })
})

describe('revalidatePost', () => {
  const published = { slug: 'novy', _status: 'published' }

  it('publikovaný: cesta, výpis profilem expire 0, feedy max, ping IndexNow', () => {
    revalidatePost(args(published, {}, { slug: 'novy', _status: 'draft' }))
    expect(pathCalls()).toEqual(['/aktuality/novy'])
    expect(tagCalls()).toEqual([
      ['posts-list', { expire: 0 }],
      ['posts-sitemap', 'max'],
      ['llms-txt', 'max'],
    ])
    expect(pingIndexNow).toHaveBeenCalledWith(['/aktuality/novy'], expect.anything())
  })

  it('odpublikovaný: revaliduje starou cestu, bez pingu', () => {
    revalidatePost(args({ slug: 'a', _status: 'draft' }, {}, { slug: 'a', _status: 'published' }))
    expect(pathCalls()).toEqual(['/aktuality/a'])
    expect(tagCalls()).toHaveLength(3)
    expect(pingIndexNow).not.toHaveBeenCalled()
  })

  it('přejmenovaný slug: nová cesta i stará, tagy jen jednou', () => {
    revalidatePost(args(published, {}, { slug: 'stary', _status: 'published' }))
    expect(pathCalls()).toEqual(['/aktuality/novy', '/aktuality/stary'])
    expect(tagCalls()).toHaveLength(3)
  })

  it('koncept bez předchozí publikace nedělá nic', () => {
    revalidatePost(args({ slug: 'x', _status: 'draft' }, {}, { slug: 'x', _status: 'draft' }))
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('disableRevalidate', () => {
    revalidatePost(args(published, { disableRevalidate: true }, { _status: 'draft' }))
    revalidatePostDelete(args(published, { disableRevalidate: true }))
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('smazání: cesta + stejné tagy', () => {
    revalidatePostDelete(args({ slug: 'smazany', _status: 'published' }))
    expect(pathCalls()).toEqual(['/aktuality/smazany'])
    expect(tagCalls()).toEqual([
      ['posts-list', { expire: 0 }],
      ['posts-sitemap', 'max'],
      ['llms-txt', 'max'],
    ])
  })
})

describe('revalidatePage', () => {
  it('home: / i /treninky, feedy max, ping obou cest', () => {
    revalidatePage(args({ slug: 'home', _status: 'published' }, {}, { _status: 'draft' }))
    expect(pathCalls()).toEqual(['/', '/treninky'])
    expect(tagCalls()).toEqual([
      ['pages-sitemap', 'max'],
      ['llms-txt', 'max'],
    ])
    expect(pingIndexNow).toHaveBeenCalledWith(['/', '/treninky'], expect.anything())
  })

  it('běžná stránka a její odpublikování', () => {
    revalidatePage(args({ slug: 'o-nas', _status: 'published' }, {}, { _status: 'draft' }))
    expect(pathCalls()).toEqual(['/o-nas'])

    revalidatePath.mockClear()
    pingIndexNow.mockClear()
    revalidatePage(
      args({ slug: 'o-nas', _status: 'draft' }, {}, { slug: 'o-nas', _status: 'published' }),
    )
    expect(pathCalls()).toEqual(['/o-nas'])
    expect(pingIndexNow).not.toHaveBeenCalled()
  })

  it('smazání home stránky', () => {
    revalidatePageDelete(args({ slug: 'home' }))
    expect(pathCalls()).toEqual(['/', '/treninky'])
    expect(tagCalls()).toHaveLength(2)
  })
})

describe('POST /internal/revalidate', () => {
  it('landing cesty a tagy profilem expire 0, sitemapa zápasů profilem max', async () => {
    vi.stubEnv('CRON_SECRET', 'tajne')
    const { POST } = await import('@/app/internal/revalidate/route')
    vi.spyOn(console, 'info').mockImplementation(() => undefined)

    const res = POST(
      new Request('http://x/internal/revalidate', {
        method: 'POST',
        headers: { authorization: 'Bearer tajne' },
      }),
    )
    expect(res.status).toBe(200)
    expect(pathCalls()).toEqual(['/', '/historie-klubu', '/soupiska', '/sponzori'])
    expect(tagCalls()).toEqual([
      ['site-config', { expire: 0 }],
      ['posts-list', { expire: 0 }],
      ['galleries-list', { expire: 0 }],
      ['matches-list', { expire: 0 }],
      ['matches-sitemap', 'max'],
    ])
  })

  it('bez tajemství vrací 401 a nic nerevaliduje', async () => {
    vi.stubEnv('CRON_SECRET', 'tajne')
    const { POST } = await import('@/app/internal/revalidate/route')
    const res = POST(new Request('http://x/internal/revalidate', { method: 'POST' }))
    expect(res.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})
