import { describe, expect, it } from 'vitest'

import { MAX_LIST_PAGE, parsePageParam } from '@/landing/lib/listUrl'

describe('parsePageParam', () => {
  it('chybějící a neplatná hodnota je první strana', () => {
    for (const raw of [undefined, '', 'abc', '0', '-3', 'NaN', '  ']) {
      expect(parsePageParam(raw)).toBe(1)
    }
  })

  it('platné číslo projde', () => {
    expect(parsePageParam('1')).toBe(1)
    expect(parsePageParam('7')).toBe(7)
    expect(parsePageParam('12abc')).toBe(12)
  })

  it('horní mez ořízne obří čísla', () => {
    expect(parsePageParam('999999')).toBe(MAX_LIST_PAGE)
    expect(parsePageParam('99999999999999999999999')).toBe(MAX_LIST_PAGE)
    expect(parsePageParam(String(MAX_LIST_PAGE))).toBe(MAX_LIST_PAGE)
    expect(parsePageParam(String(MAX_LIST_PAGE + 1))).toBe(MAX_LIST_PAGE)
    expect(parsePageParam('50', 10)).toBe(10)
  })

  it('pole z opakovaného parametru bere první hodnotu', () => {
    expect(parsePageParam(['3', '9'])).toBe(3)
    expect(parsePageParam([])).toBe(1)
  })
})
