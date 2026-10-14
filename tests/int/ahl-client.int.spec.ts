import { describe, expect, it, vi } from 'vitest'

import { AhlFetchError, createAhlClient } from '../../src/ahl'

const ok = (body: string, status = 200) => new Response(body, { status })

describe('ahl klient', () => {
  it('posílá identifikující User-Agent a vrací text', async () => {
    const fetchImpl = vi.fn(async () => ok('<html>x</html>'))
    const onRequest = vi.fn()
    const c = createAhlClient({ fetchImpl: fetchImpl as never, delayMs: 0, onRequest })
    expect(await c.get('https://x/a')).toBe('<html>x</html>')
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1]
    expect((init.headers as Record<string, string>)['User-Agent']).toContain('hccestice.cz')
    expect(onRequest).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://x/a', status: 200 }))
    expect(c.requestCount).toBe(1)
  })

  it('opakuje 5xx a síťovou chybu, 4xx ne', async () => {
    const f1 = vi.fn().mockResolvedValueOnce(ok('', 503)).mockResolvedValueOnce(ok('dobre'))
    const c1 = createAhlClient({ fetchImpl: f1 as never, delayMs: 0, retries: 1 })
    expect(await c1.get('u')).toBe('dobre')
    expect(c1.requestCount).toBe(2)

    const f2 = vi.fn().mockRejectedValueOnce(new TypeError('fetch failed')).mockResolvedValueOnce(ok('ok'))
    expect(await createAhlClient({ fetchImpl: f2 as never, delayMs: 0 }).get('u')).toBe('ok')

    const f3 = vi.fn(async () => ok('', 404))
    const c3 = createAhlClient({ fetchImpl: f3 as never, delayMs: 0 })
    await expect(c3.get('u')).rejects.toMatchObject({ name: 'AhlFetchError', status: 404, url: 'u' })
    expect(f3).toHaveBeenCalledTimes(1)
  })

  it('po vyčerpání pokusů hodí AhlFetchError', async () => {
    const f = vi.fn(async () => ok('', 500))
    const c = createAhlClient({ fetchImpl: f as never, delayMs: 0, retries: 1 })
    await expect(c.get('u')).rejects.toBeInstanceOf(AhlFetchError)
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('timeout přeruší požadavek', async () => {
    const f = vi.fn(
      (_u: string, init: RequestInit) =>
        new Promise<Response>((_res, rej) => {
          init.signal!.addEventListener('abort', () => rej(new Error('aborted')))
        }),
    )
    const c = createAhlClient({ fetchImpl: f as never, delayMs: 0, timeoutMs: 20, retries: 0 })
    await expect(c.get('u')).rejects.toMatchObject({ status: 0 })
  })

  it('souběžná volání jdou sekvenčně s prodlevou', async () => {
    const starts: number[] = []
    const f = vi.fn(async () => {
      starts.push(Date.now())
      return ok('x')
    })
    const c = createAhlClient({ fetchImpl: f as never, delayMs: 60 })
    await Promise.all([c.get('a'), c.get('b'), c.get('c')])
    expect(starts[1] - starts[0]).toBeGreaterThanOrEqual(50)
    expect(starts[2] - starts[1]).toBeGreaterThanOrEqual(50)
  })
})
