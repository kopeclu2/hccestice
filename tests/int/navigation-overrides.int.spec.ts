import type { CollectionConfig, Config, Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { navigationOverrides } from '@/plugins/navigationOverrides'

/**
 * Minimální napodobenina kolekcí z `payload-cms-navigation-plugin` —
 * jen pole, která adaptér čte. Test tak hlídá chování adaptéru, ne tvar
 * celého pluginu.
 */
const pluginItem = (): CollectionConfig =>
  ({
    slug: 'navigation-items',
    labels: { singular: 'Navigation Item', plural: 'Navigation Items' },
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      {
        name: 'type',
        type: 'select',
        options: [
          { label: 'Internal', value: 'internal' },
          { label: 'External', value: 'external' },
          { label: 'Folder', value: 'folder' },
        ],
      },
      { name: 'url', type: 'text', label: 'URL' },
      { name: 'order', type: 'number' },
      { name: 'className', type: 'text' },
      { name: 'parent', type: 'text' },
      { name: 'active', type: 'checkbox' },
    ],
  }) as CollectionConfig

const pluginContainer = (): CollectionConfig =>
  ({
    slug: 'navigation-containers',
    labels: { singular: 'Navigation', plural: 'Navigations' },
    fields: [
      { name: 'name', type: 'text' },
      { name: 'slug', type: 'text' },
      { name: 'items', type: 'relationship', relationTo: 'navigation-items', hasMany: true },
      { name: 'settings', type: 'group', fields: [] },
    ],
  }) as CollectionConfig

const run = (collections: CollectionConfig[]): Config =>
  navigationOverrides()({ collections } as Config) as Config

const field = (collection: CollectionConfig, name: string): Field | undefined =>
  collection.fields.find((f) => 'name' in f && f.name === name)

const find = (config: Config, slug: string): CollectionConfig =>
  config.collections!.find((c) => c.slug === slug)!

describe('navigationOverrides', () => {
  it.each([
    ['chybí kontejner', () => [pluginItem()]],
    ['chybí položky', () => [pluginContainer()]],
    ['chybí obě', () => []],
  ])('hodí výjimku, když kolekce pluginu nenajde (%s)', (_name, build) => {
    expect(() => run(build())).toThrow(/navigation-containers \/ navigation-items nenalezeny/)
  })

  it('přeloží labely kolekcí', () => {
    const config = run([pluginContainer(), pluginItem()])
    expect(find(config, 'navigation-containers').labels).toEqual({
      singular: 'Menu',
      plural: 'Menu',
    })
    expect(find(config, 'navigation-items').labels).toEqual({
      singular: 'Položka menu',
      plural: 'Položky menu',
    })
  })

  it('přeloží labely polí a zařadí kolekce do skupiny Nastavení', () => {
    const config = run([pluginContainer(), pluginItem()])
    const item = find(config, 'navigation-items')
    const container = find(config, 'navigation-containers')

    expect(item.admin?.group).toBe('Nastavení')
    expect(container.admin?.group).toBe('Nastavení')
    expect(field(item, 'title')).toMatchObject({ label: 'Text odkazu' })
    expect(field(item, 'url')).toMatchObject({ label: 'Cesta na podstránku' })
    expect(field(container, 'items')).toMatchObject({ label: 'Položky menu' })
  })

  it('skryje pole pluginu, která projekt nepoužívá, a nechá viditelná ostatní', () => {
    const item = find(run([pluginContainer(), pluginItem()]), 'navigation-items')
    for (const name of ['order', 'className', 'parent']) {
      expect((field(item, name) as { admin?: { hidden?: boolean } }).admin?.hidden).toBe(true)
    }
    expect((field(item, 'title') as { admin?: { hidden?: boolean } }).admin?.hidden).toBeUndefined()
  })

  it('přidá pole anchor těsně za url', () => {
    const item = find(run([pluginContainer(), pluginItem()]), 'navigation-items')
    const names = item.fields.map((f) => ('name' in f ? f.name : undefined))
    expect(names.indexOf('anchor')).toBe(names.indexOf('url') + 1)
  })

  it('typ položky nabídne „Cestu nebo kotvu" jako external', () => {
    const item = find(run([pluginContainer(), pluginItem()]), 'navigation-items')
    const type = field(item, 'type') as { options: { label: string; value: string }[] }
    expect(type.options).toContainEqual({ label: 'Cesta nebo kotva', value: 'external' })
  })

  it('odstraní veřejné endpointy pluginu /api/navigation*, ostatní nechá', () => {
    const noop = async () => new Response()
    const other = { path: '/vchl-sync/status', method: 'get' as const, handler: noop }
    const input = {
      collections: [pluginContainer(), pluginItem()],
      endpoints: [
        { path: '/api/navigation', method: 'get', handler: noop },
        { path: '/api/navigation/:slug', method: 'get', handler: noop },
        { path: '/api/navigation-items', method: 'get', handler: noop },
        other,
      ],
    }
    // Test dává pluginu jen pole, která čte (viz výše) — zbytek `Config` nechybí.
    const config = navigationOverrides()(input as unknown as Config) as Config
    expect(config.endpoints).toEqual([other])
  })

  it('bez endpointů v configu nespadne', () => {
    expect(() => run([pluginContainer(), pluginItem()])).not.toThrow()
  })

  it('obě kolekce dostanou revalidační hooky na změnu i smazání', () => {
    const config = run([pluginContainer(), pluginItem()])
    for (const slug of ['navigation-containers', 'navigation-items']) {
      const collection = find(config, slug)
      expect(collection.hooks?.afterChange?.length).toBeGreaterThan(0)
      expect(collection.hooks?.afterDelete?.length).toBeGreaterThan(0)
    }
  })

  it('čtení je veřejné, zápis jen pro přihlášené', () => {
    const item = find(run([pluginContainer(), pluginItem()]), 'navigation-items')
    expect(item.access?.read?.({ req: {} } as never)).toBe(true)
    expect(item.access?.update?.({ req: { user: null } } as never)).toBe(false)
    expect(item.access?.update?.({ req: { user: { id: 1 } } } as never)).toBe(true)
  })

  describe('validace url', () => {
    const validate = () => {
      const item = find(run([pluginContainer(), pluginItem()]), 'navigation-items')
      return (field(item, 'url') as { validate: (v: unknown, o: unknown) => unknown }).validate
    }

    it('external bez cesty i kotvy neprojde', () => {
      expect(validate()('', { data: { type: 'external' } })).toEqual(expect.any(String))
    })

    it('external jen s kotvou (sekce bez podstránky) projde', () => {
      expect(validate()('', { data: { type: 'external', anchor: 'klub' } })).toBe(true)
    })

    it('external jen s cestou projde', () => {
      expect(validate()('/zapasy', { data: { type: 'external' } })).toBe(true)
    })

    it('jiné typy url nevyžadují', () => {
      expect(validate()('', { data: { type: 'internal' } })).toBe(true)
      expect(validate()('', { data: { type: 'folder' } })).toBe(true)
    })
  })
})
