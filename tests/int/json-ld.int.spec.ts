import { describe, expect, it } from 'vitest'

import { serializeJsonLd } from '../../src/utilities/jsonLd'

describe('serializeJsonLd', () => {
  it('nenechá v řetězci žádné `<`, takže `</script>` nic neuzavře', () => {
    const out = serializeJsonLd({ name: 'Novák</script><img src=x onerror=alert(1)>' })
    expect(out).not.toContain('<')
    expect(out).not.toContain('</')
  })

  it('JSON se po parsování vrátí beze změny', () => {
    const data = { a: '</script>', b: [1, 'x < y'], c: { d: null } }
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data)
  })
})
