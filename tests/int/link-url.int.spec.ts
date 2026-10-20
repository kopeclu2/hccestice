import { describe, expect, it } from 'vitest'

import { embedUrlValidator } from '@/lib/embedHosts'
import { isSafeLinkUrl, LINK_URL_ERROR, linkUrlValidator } from '@/lib/linkUrl'

describe('isSafeLinkUrl', () => {
  it.each([
    'https://example.cz/a?b=c',
    'http://example.cz',
    'HTTPS://EXAMPLE.CZ',
    '  https://example.cz  ',
    'mailto:klub@example.cz',
    'tel:+420123456789',
    '/zapasy',
    '/',
    '#sezona',
    '//cdn.example.cz/x',
  ])('povolí %j', (url) => {
    expect(isSafeLinkUrl(url)).toBe(true)
  })

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    '  javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    '\u0001javascript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'ftp://example.cz',
    'file:///etc/passwd',
    'example.cz',
    'www.example.cz',
    '',
    '   ',
  ])('zakáže %j', (url) => {
    expect(isSafeLinkUrl(url)).toBe(false)
  })

  it('nestringové hodnoty jsou nebezpečné', () => {
    expect(isSafeLinkUrl(null)).toBe(false)
    expect(isSafeLinkUrl(undefined)).toBe(false)
    expect(isSafeLinkUrl(42)).toBe(false)
  })
})

describe('linkUrlValidator', () => {
  it('nepovinné pole: prázdné projde, nebezpečné ne', () => {
    const validate = linkUrlValidator()
    expect(validate('')).toBe(true)
    expect(validate(undefined)).toBe(true)
    expect(validate(null)).toBe(true)
    expect(validate('/zapasy')).toBe(true)
    expect(validate('javascript:alert(1)')).toBe(LINK_URL_ERROR)
  })

  it('povinné pole: prázdné neprojde', () => {
    const validate = linkUrlValidator({ required: true })
    expect(validate('')).not.toBe(true)
    expect(validate('  ')).not.toBe(true)
    expect(validate(undefined)).not.toBe(true)
    expect(validate('https://example.cz')).toBe(true)
  })
})

describe('embedUrlValidator', () => {
  it('povolí hosty ze seznamu, zakáže ostatní', () => {
    const validate = embedUrlValidator({ required: true })
    expect(validate('https://www.ahl.cz/soutez/x/tabulky/')).toBe(true)
    expect(validate('https://maps.google.com/maps?q=x&output=embed')).toBe(true)
    expect(validate('https://evil.example/')).toEqual(expect.any(String))
    expect(validate('javascript:alert(1)')).toEqual(expect.any(String))
    expect(validate('')).toEqual(expect.any(String))
  })
})
