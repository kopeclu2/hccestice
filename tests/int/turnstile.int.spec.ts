import type { CollectionBeforeOperationHook } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { verifyTurnstile } from '@/hooks/verifyTurnstile'
import { TURNSTILE_HEADER } from '@/lib/turnstile/config'
import { verifyTurnstileToken } from '@/lib/turnstile/verify'

const siteverify = (body: unknown, init: ResponseInit = { status: 200 }) =>
  vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), init))

describe('verifyTurnstileToken', () => {
  it('bez secretu mimo produkci projde, v produkci ne', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(await verifyTurnstileToken({ token: null, secret: '', isProd: false })).toEqual({
      ok: true,
    })
    const prod = await verifyTurnstileToken({ token: 'x', secret: '', isProd: true })
    expect(prod.ok).toBe(false)
    warn.mockRestore()
  })

  it('bez tokenu neprojde a Cloudflare se ani nevolá', async () => {
    const fetchImpl = siteverify({ success: true })
    const result = await verifyTurnstileToken({ token: null, secret: 's', fetchImpl })
    expect(result).toEqual({ ok: false, reason: 'chybí token' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('platný token projde a posílá secret, token i IP', async () => {
    const fetchImpl = siteverify({ success: true })
    const result = await verifyTurnstileToken({
      token: 'tok',
      remoteIp: '203.0.113.7',
      secret: 'sec',
      fetchImpl,
    })
    expect(result).toEqual({ ok: true })

    const [url, init] = fetchImpl.mock.calls[0]!
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
    const body = init?.body as URLSearchParams
    expect(body.get('secret')).toBe('sec')
    expect(body.get('response')).toBe('tok')
    expect(body.get('remoteip')).toBe('203.0.113.7')
  })

  it('odmítnutý token vrátí kódy chyb', async () => {
    const fetchImpl = siteverify({ success: false, 'error-codes': ['timeout-or-duplicate'] })
    const result = await verifyTurnstileToken({ token: 'tok', secret: 's', fetchImpl })
    expect(result).toEqual({ ok: false, reason: 'odmítnuto: timeout-or-duplicate' })
  })

  it('chybová odpověď a výpadek Cloudflaru neprojdou (fail closed)', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    const http500 = siteverify({}, { status: 500 })
    expect((await verifyTurnstileToken({ token: 't', secret: 's', fetchImpl: http500 })).ok).toBe(
      false,
    )

    const down = vi.fn<typeof fetch>(async () => {
      throw new Error('síť')
    })
    expect((await verifyTurnstileToken({ token: 't', secret: 's', fetchImpl: down })).ok).toBe(
      false,
    )
    error.mockRestore()
  })
})

describe('hook verifyTurnstile', () => {
  const run = (overrides: {
    operation?: string
    payloadAPI?: string
    user?: unknown
    headers?: Record<string, string>
  }) => {
    const warn = vi.fn()
    const args = { sentinel: true }
    // Hook bere plný `req`; test dodává jen to, co hook čte.
    const hook = verifyTurnstile as (a: unknown) => ReturnType<CollectionBeforeOperationHook>
    const result = hook({
      args,
      operation: overrides.operation ?? 'create',
      req: {
        payloadAPI: overrides.payloadAPI ?? 'REST',
        user: overrides.user,
        headers: new Headers(overrides.headers),
        payload: { logger: { warn } },
      },
    })
    return { result, args, warn }
  }

  it('přeskočí local API, přihlášeného správce a jiné operace než create', async () => {
    for (const o of [{ payloadAPI: 'local' }, { user: { id: 1 } }, { operation: 'read' }]) {
      const { result, args } = run(o)
      expect(await result).toBe(args)
    }
  })

  it('REST create bez platného tokenu skončí 403 a zapíše varování', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'sec')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ success: false }))),
    )

    const { result, warn } = run({ headers: { [TURNSTILE_HEADER]: 'spatny' } })
    await expect(result).rejects.toMatchObject({ status: 403 })
    expect(warn).toHaveBeenCalledOnce()

    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })
})
