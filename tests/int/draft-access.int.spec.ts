import { beforeEach, describe, expect, it, vi } from 'vitest'

const draftModeMock = vi.fn()
const headersMock = vi.fn()
const authMock = vi.fn()
const findMock = vi.fn()
const findByIDMock = vi.fn()

vi.mock('next/headers', () => ({
  draftMode: () => draftModeMock(),
  headers: () => headersMock(),
}))

vi.mock('@/landing/data/query', () => ({
  getPayloadClient: async () => ({ auth: authMock, find: findMock, findByID: findByIDMock }),
  cachedQuery: (fn: unknown) => fn,
}))

// Fetchery postů tahají i `site` (Payload config) — pro tyhle testy nejsou potřeba.
vi.mock('@/landing/data/site', () => ({ fetchSiteConfig: vi.fn() }))

import { fetchDraftUser } from '@/landing/data/draft'
import { fetchPageBySlug } from '@/landing/features/pages/data'
import { fetchPost, fetchPostBySlug } from '@/landing/features/posts/data/posts'
import { fetchTrainingsBlock } from '@/landing/features/trainings/data'

const admin = { id: 1, email: 'a@b.cz' }

beforeEach(() => {
  vi.clearAllMocks()
  headersMock.mockResolvedValue(new Headers())
  findMock.mockResolvedValue({ docs: [] })
})

describe('fetchDraftUser', () => {
  it('bez draft módu vrací null a nesahá na headers() ani auth', async () => {
    draftModeMock.mockResolvedValue({ isEnabled: false })
    expect(await fetchDraftUser()).toBeNull()
    expect(headersMock).not.toHaveBeenCalled()
    expect(authMock).not.toHaveBeenCalled()
  })

  it('v draft módu bez přihlášení (zapomenutá cookie) vrací null', async () => {
    draftModeMock.mockResolvedValue({ isEnabled: true })
    authMock.mockResolvedValue({ user: null })
    expect(await fetchDraftUser()).toBeNull()
    expect(authMock).toHaveBeenCalledTimes(1)
  })

  it('v draft módu s přihlášením vrací uživatele', async () => {
    draftModeMock.mockResolvedValue({ isEnabled: true })
    authMock.mockResolvedValue({ user: admin })
    expect(await fetchDraftUser()).toEqual(admin)
  })

  it('selhání ověření skončí jako null, ne výjimkou', async () => {
    draftModeMock.mockResolvedValue({ isEnabled: true })
    authMock.mockRejectedValue(new Error('db'))
    expect(await fetchDraftUser()).toBeNull()
  })
})

describe('fetchPageBySlug', () => {
  it('běžný návštěvník: publikované, přístupová pravidla zapnutá, headers() se nevolá', async () => {
    draftModeMock.mockResolvedValue({ isEnabled: false })
    await fetchPageBySlug('home')
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ draft: false, overrideAccess: false, user: null }),
    )
    expect(headersMock).not.toHaveBeenCalled()
  })

  it('zapomenutá cookie draft módu bez přihlášení koncepty neukáže', async () => {
    draftModeMock.mockResolvedValue({ isEnabled: true })
    authMock.mockResolvedValue({ user: null })
    await fetchPageBySlug('kontakty')
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ draft: false, overrideAccess: false }),
    )
  })

  it('přihlášený správce v draft módu čte koncepty jako sám sebe', async () => {
    draftModeMock.mockResolvedValue({ isEnabled: true })
    authMock.mockResolvedValue({ user: admin })
    await fetchPageBySlug('klub')
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ draft: true, overrideAccess: false, user: admin }),
    )
  })
})

describe('fetchPostBySlug', () => {
  it('draft=false nevolá ani draftMode(), ani headers()', async () => {
    await fetchPostBySlug('clanek', false)
    expect(draftModeMock).not.toHaveBeenCalled()
    expect(headersMock).not.toHaveBeenCalled()
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ draft: false, overrideAccess: false }),
    )
  })

  it('draft=true bez přihlášení vrací jen publikované', async () => {
    draftModeMock.mockResolvedValue({ isEnabled: true })
    authMock.mockResolvedValue({ user: null })
    await fetchPostBySlug('clanek2', true)
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ draft: false, overrideAccess: false }),
    )
  })
})

describe('fetchPost (vypíchnutý článek)', () => {
  it('nepublikovaný článek se běžnému návštěvníkovi nevrací', async () => {
    draftModeMock.mockResolvedValue({ isEnabled: false })
    findByIDMock.mockResolvedValue({ id: 5, _status: 'draft' })
    expect(await fetchPost(5)).toBeNull()
    expect(findByIDMock).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: false }))
  })

  it('publikovaný článek projde', async () => {
    draftModeMock.mockResolvedValue({ isEnabled: false })
    findByIDMock.mockResolvedValue({ id: 6, _status: 'published' })
    expect(await fetchPost(6)).toMatchObject({ id: 6 })
  })

  it('správce v draft módu vidí i koncept', async () => {
    draftModeMock.mockResolvedValue({ isEnabled: true })
    authMock.mockResolvedValue({ user: admin })
    findByIDMock.mockResolvedValue({ id: 7, _status: 'draft' })
    expect(await fetchPost(7)).toMatchObject({ id: 7 })
    expect(findByIDMock).toHaveBeenCalledWith(
      expect.objectContaining({ draft: true, user: admin, overrideAccess: false }),
    )
  })
})

describe('fetchTrainingsBlock', () => {
  it('čte homepage s přístupovými pravidly (koncept se nevrací)', async () => {
    await fetchTrainingsBlock()
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'pages', overrideAccess: false }),
    )
  })
})
