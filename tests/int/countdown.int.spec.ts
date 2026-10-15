import { describe, expect, it } from 'vitest'

import { toCountdownUnits } from '@/landing/features/matches/components/useCountdown'

const values = (ms: number | null) => toCountdownUnits(ms).map((unit) => unit.value)

describe('toCountdownUnits', () => {
  it('před prvním výpočtem (server) kreslí „--", aby se HTML shodovalo s klientem', () => {
    expect(values(null)).toEqual(['--', '--', '--', '--'])
  })

  it('rozloží čas na dny, hodiny, minuty a vteřiny s předními nulami', () => {
    const ms = ((2 * 24 + 3) * 60 * 60 + 4 * 60 + 5) * 1000
    expect(values(ms)).toEqual(['02', '03', '04', '05'])
  })

  it('zachová pořadí a popisky jednotek', () => {
    expect(toCountdownUnits(0).map((unit) => unit.label)).toEqual(['dní', 'hod', 'min', 'sek'])
  })

  it('víc než 99 dní nezkracuje', () => {
    expect(values(120 * 86_400_000)[0]).toBe('120')
  })

  it('nula = cíl uplynul (komponenta pak ukáže větu místo nul)', () => {
    expect(values(0)).toEqual(['00', '00', '00', '00'])
  })
})
