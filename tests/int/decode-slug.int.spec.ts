import { describe, expect, it } from 'vitest'

import { decodeSegments, decodeSlug } from '@/lib/decodeSlug'

describe('decodeSlug', () => {
  it('dekóduje procentové kódování', () => {
    expect(decodeSlug('hc-zdar')).toBe('hc-zdar')
    expect(decodeSlug('cestice%20%C5%BE')).toBe('cestice ž')
  })

  it('neplatné kódování je null, ne výjimka', () => {
    expect(decodeSlug('%zz')).toBeNull()
    expect(decodeSlug('%25zz')).toBe('%zz')
    expect(decodeSlug('%E0%A4%A')).toBeNull()
    expect(decodeSlug('%')).toBeNull()
  })
})

describe('decodeSegments', () => {
  it('dekóduje všechny segmenty', () => {
    expect(decodeSegments(['a', 'b%20c.html'])).toEqual(['a', 'b c.html'])
    expect(decodeSegments([])).toEqual([])
  })

  it('jeden neplatný segment shodí celek na null', () => {
    expect(decodeSegments(['a', '%zz', 'c'])).toBeNull()
  })
})
