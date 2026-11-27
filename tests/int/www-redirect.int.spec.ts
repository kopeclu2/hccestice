import { afterEach, describe, expect, it, vi } from 'vitest'

import { redirects } from '../../redirects'

afterEach(() => vi.unstubAllEnvs())

const rules = async () => (await redirects!()) ?? []

describe('redirect www → apex', () => {
  it('pro produkční adresu je první pravidlo a je trvalé', async () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://hccestice.cz')
    const [first] = await rules()
    expect(first).toEqual({
      source: '/:path*',
      has: [{ type: 'host', value: 'www.hccestice.cz' }],
      destination: 'https://hccestice.cz/:path*',
      permanent: true,
    })
  })

  it('bez platné adresy pravidlo nevznikne a build nespadne', async () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', '')
    const result = await rules()
    expect(result.some((r) => 'has' in r && r.has?.some((h) => h.type === 'host'))).toBe(false)
  })

  it('adresa už s www se nepřesměrovává sama na sebe', async () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://www.hccestice.cz')
    const result = await rules()
    expect(result.some((r) => 'has' in r && r.has?.some((h) => h.type === 'host'))).toBe(false)
  })
})
