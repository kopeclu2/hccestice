import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  FORGOT_PASSWORD_LIMIT,
  guardAuthOperations,
  LOGIN_LIMIT,
} from '@/collections/Users/hooks/guardAuthOperations'
import { MIN_PASSWORD_LENGTH, passwordPolicyError } from '@/lib/passwordPolicy'

describe('passwordPolicyError', () => {
  it('krátké heslo je chyba, 12 znaků projde', () => {
    expect(passwordPolicyError('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toMatch(/alespoň 12 znaků/)
    expect(passwordPolicyError('a'.repeat(MIN_PASSWORD_LENGTH))).toBeNull()
  })

  it('chybějící nebo prázdné heslo (uživatel ho nemění) se neřeší', () => {
    expect(passwordPolicyError(undefined)).toBeNull()
    expect(passwordPolicyError(null)).toBeNull()
    expect(passwordPolicyError('')).toBeNull()
  })

  it('znak mimo BMP se počítá za jeden', () => {
    expect(passwordPolicyError('😀'.repeat(11))).not.toBeNull()
    expect(passwordPolicyError('😀'.repeat(12))).toBeNull()
  })
})

describe('guardAuthOperations', () => {
  const req = (ip: string, payloadAPI: PayloadRequest['payloadAPI'] = 'REST') =>
    ({ payloadAPI, headers: new Headers({ 'x-forwarded-for': ip }) }) as PayloadRequest

  const run = (operation: string, ip: string, args: unknown = {}, api?: 'local' | 'REST') =>
    (guardAuthOperations as unknown as (a: unknown) => unknown)({
      args,
      operation,
      req: req(ip, api),
    })

  it('login: po limitu z jedné IP hodí 429 česky, jiná IP projde', () => {
    const ip = '198.51.100.10'
    for (let i = 0; i < LOGIN_LIMIT.max; i += 1) expect(() => run('login', ip)).not.toThrow()
    expect(() => run('login', ip)).toThrow(/Příliš mnoho pokusů/)
    try {
      run('login', ip)
    } catch (error) {
      expect((error as { status: number }).status).toBe(429)
    }
    expect(() => run('login', '198.51.100.11')).not.toThrow()
  })

  it('forgotPassword má vlastní, přísnější limit a oddělený klíč od loginu', () => {
    const ip = '198.51.100.20'
    run('login', ip)
    for (let i = 0; i < FORGOT_PASSWORD_LIMIT.max; i += 1) {
      expect(() => run('forgotPassword', ip)).not.toThrow()
    }
    expect(() => run('forgotPassword', ip)).toThrow(/Příliš mnoho pokusů/)
    // login z téže IP tím není dotčený
    expect(() => run('login', ip)).not.toThrow()
  })

  it('Local API se neomezuje', () => {
    const ip = '198.51.100.30'
    for (let i = 0; i < LOGIN_LIMIT.max + 5; i += 1) {
      expect(() => run('login', ip, {}, 'local')).not.toThrow()
    }
    expect(() => run('create', ip, { data: { password: 'test' } }, 'local')).not.toThrow()
  })

  it.each(['create', 'update', 'resetPassword'])('%s: krátké heslo je ValidationError', (op) => {
    expect(() => run(op, '198.51.100.40', { data: { password: 'krátké' } })).toThrow()
  })

  it.each(['create', 'update', 'resetPassword'])('%s: dlouhé heslo i bez hesla projde', (op) => {
    expect(() =>
      run(op, '198.51.100.41', { data: { password: 'dostatecne-dlouhe-heslo' } }),
    ).not.toThrow()
    expect(() => run(op, '198.51.100.41', { data: { name: 'Jan' } })).not.toThrow()
  })

  it('ostatní operace (čtení) se nedotýká', () => {
    expect(() => run('read', '198.51.100.50', { limit: 1 })).not.toThrow()
  })
})
