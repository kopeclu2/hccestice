import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }))

import { POST } from '@/app/internal/revalidate/route'
import { CACHE_TAGS } from '@/landing/data/tags'

const SECRET = 'tajny-token-pro-cron'
const original = process.env.CRON_SECRET

const request = (authorization?: string) =>
  new Request('http://127.0.0.1:3000/internal/revalidate', {
    method: 'POST',
    headers: authorization ? { authorization } : {},
  })

beforeEach(() => {
  revalidatePath.mockReset()
  revalidateTag.mockReset()
  vi.spyOn(console, 'info').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  if (original === undefined) delete process.env.CRON_SECRET
  else process.env.CRON_SECRET = original
})

describe('POST /internal/revalidate — autorizace', () => {
  it('bez CRON_SECRET odmítne všechno, i požadavek s hlavičkou', async () => {
    delete process.env.CRON_SECRET

    expect((await POST(request())).status).toBe(401)
    expect((await POST(request('Bearer '))).status).toBe(401)
    expect((await POST(request('Bearer undefined'))).status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('prázdný CRON_SECRET se bere jako nenastavený', async () => {
    process.env.CRON_SECRET = ''

    expect((await POST(request('Bearer '))).status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it.each([
    ['bez hlavičky', undefined],
    ['špatný token', 'Bearer neco-jineho-stejne-dlouhe!'],
    ['token bez schématu', SECRET],
    ['jiné schéma', `Basic ${SECRET}`],
    ['kratší token', `Bearer ${SECRET.slice(0, -1)}`],
    ['delší token', `Bearer ${SECRET}x`],
  ])('%s → 401 a nic se nerevaliduje', async (_name, header) => {
    process.env.CRON_SECRET = SECRET

    const response = await POST(request(header))

    expect(response.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('správný token → 200 a zrevaliduje landing i sitemapu zápasů', async () => {
    process.env.CRON_SECRET = SECRET

    const response = await POST(request(`Bearer ${SECRET}`))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ revalidated: true })
    expect(response.headers.get('cache-control')).toBe('no-store')

    // Redakční obsah expiruje hned, crawlerský feed stale-while-revalidate.
    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.matches, { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.matchesSitemap, 'max')
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })
})
