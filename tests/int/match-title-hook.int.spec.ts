import type { FieldHook, PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { matchDisplayTitle } from '../../src/hooks/matchDisplayTitle'
import { generateMatchSlug } from '../../src/hooks/matchSlug'
import { resolveOpponent } from '../../src/hooks/resolveOpponent'

const opponent = { id: 5, name: 'HC Zdar', slug: 'hc-zdar' }

const setup = (find = vi.fn(async () => opponent)) => {
  const count = vi.fn(async () => ({ totalDocs: 0 }))
  const req = { payload: { findByID: find, count }, context: {} } as unknown as PayloadRequest
  const title = (args: { data?: Record<string, unknown>; originalDoc?: Record<string, unknown> }) =>
    matchDisplayTitle({ ...args, req } as unknown as Parameters<FieldHook>[0])
  return { req, find, count, title }
}

describe('matchDisplayTitle', () => {
  it('domácí zápas: Čestice první, venkovní: soupeř první (malé „x" zůstává)', async () => {
    const { title } = setup()
    expect(await title({ data: { opponent: 5, home: true } })).toBe('HC Čestice x HC Zdar')
    expect(await title({ data: { opponent: 5, home: false } })).toBe('HC Zdar x HC Čestice')
  })

  it('částečný update bere soupeře a stranu z uloženého dokumentu', async () => {
    const { title, find } = setup()
    expect(await title({ data: {}, originalDoc: { opponent: { id: 5 }, home: false } })).toBe(
      'HC Zdar x HC Čestice',
    )
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ id: 5 }))
  })

  it('chybějící nebo nenačtitelný soupeř dá záložní jméno, uložení nespadne', async () => {
    const missing = setup()
    expect(await missing.title({ data: { home: true } })).toBe('HC Čestice x soupeř')
    expect(missing.find).not.toHaveBeenCalled()

    const broken = setup(vi.fn(async () => Promise.reject(new Error('smazán'))))
    expect(await broken.title({ data: { opponent: 9, home: false } })).toBe('soupeř x HC Čestice')
  })
})

describe('resolveOpponent', () => {
  it('při jednom uložení načte soupeře jednou, i když ho chce titulek i slug', async () => {
    const { req, find, count, title } = setup()
    await title({ data: { opponent: 5, home: true } })
    await generateMatchSlug({
      data: { opponent: 5, date: '2026-01-10T17:00:00.000Z' },
      req,
      operation: 'create',
    } as unknown as Parameters<typeof generateMatchSlug>[0])
    expect(find).toHaveBeenCalledTimes(1)
    expect(count).toHaveBeenCalled()
  })

  it('souběžná volání sdílejí jeden dotaz', async () => {
    const { req, find } = setup()
    await Promise.all([resolveOpponent(req, 5), resolveOpponent(req, { id: 5 })])
    expect(find).toHaveBeenCalledTimes(1)
  })

  it('různí soupeři se nepletou a opakovaný dotaz v téže operaci se nenačítá znovu', async () => {
    const find = vi.fn(async ({ id }: { id: number }) => ({ id, name: `T${id}`, slug: `t${id}` }))
    const req = { payload: { findByID: find } } as unknown as PayloadRequest
    expect((await resolveOpponent(req, 1))?.name).toBe('T1')
    expect((await resolveOpponent(req, 2))?.name).toBe('T2')
    await resolveOpponent(req, 1)
    expect(find).toHaveBeenCalledTimes(2)
  })

  it('paměť nepřežije operaci, ani když seed předává sdílený context', async () => {
    const find = vi.fn(async () => opponent)
    const context = {}
    const first = { payload: { findByID: find }, context } as unknown as PayloadRequest
    const second = { payload: { findByID: find }, context } as unknown as PayloadRequest
    await resolveOpponent(first, 5)
    await resolveOpponent(second, 5)
    expect(find).toHaveBeenCalledTimes(2)
    expect(context).toEqual({})
  })
})
