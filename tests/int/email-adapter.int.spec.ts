import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { resendAdapter, nodemailerAdapter } = vi.hoisted(() => ({
  resendAdapter: vi.fn((options: unknown) => ({ kind: 'resend', options })),
  nodemailerAdapter: vi.fn(async (options: unknown) => ({ kind: 'nodemailer', options })),
}))

// Skutečné adaptéry by si při zavolání sáhly na síť (Resend klient, ethereal
// účet u nodemaileru) — tady se hlídá jen to, KTERÝ se vybere a s čím.
vi.mock('@payloadcms/email-resend', () => ({ resendAdapter }))
vi.mock('@payloadcms/email-nodemailer', () => ({ nodemailerAdapter }))

import { emailAdapter } from '@/email/adapter'

const ENV_KEYS = [
  'RESEND_API_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_SECURE',
  'EMAIL_OVERRIDE_RECIPIENT',
  'EMAIL_FROM_ADDRESS',
  'EMAIL_FROM_NAME',
  'NODE_ENV',
] as const

const saved: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> = {}

beforeEach(() => {
  for (const key of ENV_KEYS) {
    saved[key] = process.env[key]
    if (key !== 'NODE_ENV') delete process.env[key]
  }
  resendAdapter.mockClear()
  nodemailerAdapter.mockClear()
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key]
    else (process.env as Record<string, string>)[key] = saved[key]!
  }
})

const setEnv = (values: Record<string, string>) => {
  for (const [key, value] of Object.entries(values)) {
    ;(process.env as Record<string, string>)[key] = value
  }
}

describe('emailAdapter — výběr podle prostředí', () => {
  it('RESEND_API_KEY vybere Resend', async () => {
    setEnv({ RESEND_API_KEY: 're_abc' })

    const adapter = (await emailAdapter()) as unknown as { kind: string }

    expect(adapter.kind).toBe('resend')
    expect(resendAdapter).toHaveBeenCalledWith(expect.objectContaining({ apiKey: 're_abc' }))
    expect(nodemailerAdapter).not.toHaveBeenCalled()
  })

  it('Resend má přednost před SMTP', async () => {
    setEnv({ RESEND_API_KEY: 're_abc', SMTP_HOST: 'smtp.example.cz' })

    await emailAdapter()

    expect(resendAdapter).toHaveBeenCalledTimes(1)
    expect(nodemailerAdapter).not.toHaveBeenCalled()
  })

  it('prázdná proměnná je totéž jako nenastavená', async () => {
    setEnv({ RESEND_API_KEY: '   ', SMTP_HOST: '' })

    const adapter = await emailAdapter()

    expect(resendAdapter).not.toHaveBeenCalled()
    expect(nodemailerAdapter).not.toHaveBeenCalled()
    expect(adapter({ payload: {} as never }).name).toBe('log')
  })

  it('SMTP_HOST vybere nodemailer; port 587 = STARTTLS, bez přihlášení', async () => {
    setEnv({ SMTP_HOST: 'smtp.example.cz' })

    const adapter = (await emailAdapter()) as unknown as { kind: string }

    expect(adapter.kind).toBe('nodemailer')
    const { transportOptions } = nodemailerAdapter.mock.calls[0][0] as {
      transportOptions: Record<string, unknown>
    }
    expect(transportOptions).toMatchObject({ host: 'smtp.example.cz', port: 587, secure: false })
    expect(transportOptions).not.toHaveProperty('auth')
  })

  it('port 465 zapne implicitní TLS, SMTP_SECURE to přebije', async () => {
    setEnv({ SMTP_HOST: 'smtp.example.cz', SMTP_PORT: '465' })
    await emailAdapter()
    expect(nodemailerAdapter.mock.calls[0][0]).toMatchObject({
      transportOptions: { port: 465, secure: true },
    })

    nodemailerAdapter.mockClear()
    setEnv({ SMTP_SECURE: 'false' })
    await emailAdapter()
    expect(nodemailerAdapter.mock.calls[0][0]).toMatchObject({
      transportOptions: { port: 465, secure: false },
    })
  })

  it('SMTP_USER přidá přihlášení', async () => {
    setEnv({ SMTP_HOST: 'smtp.example.cz', SMTP_USER: 'web', SMTP_PASSWORD: 'heslo' })

    await emailAdapter()

    expect(nodemailerAdapter.mock.calls[0][0]).toMatchObject({
      transportOptions: { auth: { user: 'web', pass: 'heslo' } },
    })
  })

  it('EMAIL_OVERRIDE_RECIPIENT se předá oběma adaptérům', async () => {
    setEnv({ RESEND_API_KEY: 're_abc', EMAIL_OVERRIDE_RECIPIENT: ' test@example.cz ' })
    await emailAdapter()
    expect(resendAdapter).toHaveBeenCalledWith(
      expect.objectContaining({ overrideRecipientAddress: 'test@example.cz' }),
    )

    delete process.env.RESEND_API_KEY
    setEnv({ SMTP_HOST: 'smtp.example.cz' })
    await emailAdapter()
    expect(nodemailerAdapter).toHaveBeenCalledWith(
      expect.objectContaining({ overrideRecipientAddress: 'test@example.cz' }),
    )
  })

  it('bez EMAIL_OVERRIDE_RECIPIENT se nepřesměrovává', async () => {
    setEnv({ RESEND_API_KEY: 're_abc' })
    await emailAdapter()
    expect(resendAdapter).toHaveBeenCalledWith(
      expect.objectContaining({ overrideRecipientAddress: undefined }),
    )
  })

  it('odesílatel jde z EMAIL_FROM_*', async () => {
    setEnv({
      RESEND_API_KEY: 're_abc',
      EMAIL_FROM_ADDRESS: 'web@hccestice.cz',
      EMAIL_FROM_NAME: 'HC Test',
    })
    await emailAdapter()
    expect(resendAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultFromAddress: 'web@hccestice.cz',
        defaultFromName: 'HC Test',
      }),
    )
  })
})

describe('emailAdapter — logAdapter bez konfigurace', () => {
  const send = async () => {
    const logger = { warn: vi.fn(), error: vi.fn() }
    const adapter = (await emailAdapter())({ payload: { logger } as never })
    const message = {
      to: ['a@example.cz', { address: 'b@example.cz' }],
      subject: 'Ahoj',
      text: 'x',
    }
    const result = await adapter.sendEmail(message)
    return { logger, adapter, message, result }
  }

  it('nic neodešle, jen zaloguje adresáty a předmět', async () => {
    const { logger, adapter, message, result } = await send()

    expect(nodemailerAdapter).not.toHaveBeenCalled()
    expect(resendAdapter).not.toHaveBeenCalled()
    expect(adapter.name).toBe('log')
    expect(result).toBe(message)
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'a@example.cz, b@example.cz', subject: 'Ahoj' }),
    )
  })

  it('v produkci je to chyba, ne varování', async () => {
    ;(process.env as Record<string, string>).NODE_ENV = 'production'

    const { logger } = await send()

    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.warn).not.toHaveBeenCalled()
  })
})
