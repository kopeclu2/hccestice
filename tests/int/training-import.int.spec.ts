import { describe, expect, it } from 'vitest'

import { parseTrainingLine } from '@/lib/trainingImport'

describe('parseTrainingLine', () => {
  it('přečte řádek z tabulky s časem od–do a skupinou', () => {
    expect(parseTrainingLine('úterý    03.11.2026    16:00-17:15    trénink Muži + děti')).toEqual({
      ok: true,
      warning: null,
      training: {
        start: '2026-11-03T16:00',
        end: '2026-11-03T17:15',
        group: 'Muži + děti',
        note: null,
      },
    })
  })

  it('zvládne tabulátory, pomlčku „–", čas bez konce a řádek bez dne', () => {
    expect(parseTrainingLine('út\t3. 11. 2026\t16:00 – 17:15\ttrénink Muži')).toMatchObject({
      ok: true,
      training: { start: '2026-11-03T16:00', end: '2026-11-03T17:15', group: 'Muži' },
    })
    expect(parseTrainingLine('06.11.2026 18:00')).toMatchObject({
      ok: true,
      training: { start: '2026-11-06T18:00', end: null, group: null },
    })
  })

  it('poznámku bere za středníkem a samotné „trénink" je bez skupiny', () => {
    expect(
      parseTrainingLine('čtvrtek 05.11.2026 17:45-19:00 trénink Muži; bez brankáře'),
    ).toMatchObject({
      training: { group: 'Muži', note: 'bez brankáře' },
    })
    expect(parseTrainingLine('čtvrtek 05.11.2026 17:45 trénink')).toMatchObject({
      training: { group: null },
    })
  })

  it('varuje, když den v týdnu nesedí k datu, ale řádek přečte', () => {
    const result = parseTrainingLine('pátek 03.11.2026 16:00-17:15 trénink Muži')
    expect(result).toMatchObject({ ok: true })
    expect(result.ok && result.warning).toContain('úterý')
  })

  it('odmítne neexistující datum, neplatný čas, konec před začátkem i nesmysl', () => {
    expect(parseTrainingLine('31.02.2026 16:00')).toMatchObject({ ok: false })
    expect(parseTrainingLine('03.11.2026 25:00')).toMatchObject({ ok: false })
    expect(parseTrainingLine('03.11.2026 17:00-16:00')).toMatchObject({ ok: false })
    expect(parseTrainingLine('trénink v úterý')).toMatchObject({ ok: false })
  })
})
