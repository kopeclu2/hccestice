import type { GroupField } from 'payload'
import { describe, expect, it } from 'vitest'

import { link } from '@/fields/link'
import { linkGroup } from '@/fields/linkGroup'

describe('link a linkGroup: overrides', () => {
  it('linkGroup s override maxRows ponechá výchozí pole a doplní limit', () => {
    const group = linkGroup({ overrides: { maxRows: 2 } })
    expect(group).toMatchObject({ name: 'links', type: 'array', maxRows: 2 })
    expect('fields' in group && group.fields).toHaveLength(1)
  })

  it('override fields nahradí výchozí pole, nepřipojí se za ně', () => {
    const group = linkGroup({
      overrides: { fields: [{ name: 'custom', type: 'text' }] },
    })
    expect('fields' in group && group.fields).toEqual([{ name: 'custom', type: 'text' }])
  })

  it('vnořený override admin zachová ostatní výchozí hodnoty', () => {
    const group = linkGroup({ overrides: { admin: { description: 'popis' } } })
    expect(group).toMatchObject({ admin: { initCollapsed: true, description: 'popis' } })
  })

  it('override jednoho linku neovlivní další volání', () => {
    link({ overrides: { admin: { description: 'jednou' } } })
    const plain = link() as GroupField
    expect(plain.admin?.description).toBeUndefined()
  })
})
