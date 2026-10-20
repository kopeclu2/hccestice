import { describe, expect, it } from 'vitest'

import { isSafePreviewPath } from '@/lib/previewPath'

const BASE = 'https://www.hccestice.cz'

describe('isSafePreviewPath', () => {
  it.each(['/a', '/', '/aktuality/clanek?x=1#h', '/%5Cevil'])('povolí %s', (path) => {
    expect(isSafePreviewPath(path, BASE)).toBe(true)
  })

  it.each([
    ['//evil', 'protokol-relativní URL'],
    ['/\\evil.com', 'zpětné lomítko, které prohlížeč čte jako /'],
    ['https://evil', 'absolutní URL'],
    ['javascript:alert(1)', 'javascript: schéma'],
    ['evil', 'cesta bez úvodního lomítka'],
    ['', 'prázdná cesta'],
  ])('odmítne %s (%s)', (path) => {
    expect(isSafePreviewPath(path, BASE)).toBe(false)
  })

  it('funguje i s lokálním základem', () => {
    expect(isSafePreviewPath('/a', 'http://localhost:3000')).toBe(true)
    expect(isSafePreviewPath('//localhost:3000', 'http://localhost:3000')).toBe(false)
  })
})
