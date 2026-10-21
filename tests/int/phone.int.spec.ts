import { describe, expect, it } from 'vitest'

import { toPersonCard } from '@/landing/lib/media'
import { cleanPhone, telHref } from '@/lib/phone'
import type { Person } from '@/payload-types'

describe('cleanPhone', () => {
  it('prázdná hodnota nebo jen předvolba není číslo', () => {
    for (const value of [undefined, null, '', '   ', '+420', '+420 ', '00420', '+ 420 -']) {
      expect(cleanPhone(value)).toBeNull()
    }
  })

  it('skutečné číslo vrátí tak, jak je zapsané', () => {
    expect(cleanPhone('+420 123 456 789')).toBe('+420 123 456 789')
    expect(cleanPhone(' 777 111 222 ')).toBe('777 111 222')
    expect(cleanPhone('00420123456789')).toBe('00420123456789')
  })
})

describe('telHref', () => {
  it('odstraní mezery včetně nedělitelné', () => {
    expect(telHref('+420 123 456 789')).toBe('tel:+420123456789')
  })
})

describe('toPersonCard: telefon', () => {
  const person = (phone: string | null): Person =>
    ({
      id: 1,
      name: 'Trenér',
      role: 'Trenér',
      phone,
      email: null,
      photo: null,
    }) as unknown as Person

  it('prázdná předvolba se nepropíše do karty, takže se nevykreslí tel: odkaz', () => {
    expect(toPersonCard(person('+420'))?.phone).toBeNull()
  })

  it('platné číslo projde', () => {
    expect(toPersonCard(person('+420 123 456 789'))?.phone).toBe('+420 123 456 789')
  })
})
