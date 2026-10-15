import { describe, expect, it } from 'vitest'

import { linkGroup } from '@/fields/linkGroup'
import deepMerge from '@/lib/deepMerge'

describe('deepMerge', () => {
  it('slučuje vnořené objekty a nemutuje vstup', () => {
    const target = { admin: { initCollapsed: true, description: 'a' }, name: 'links' }
    const merged = deepMerge(target, { admin: { initCollapsed: false }, maxRows: 2 })

    expect(merged).toEqual({
      admin: { initCollapsed: false, description: 'a' },
      name: 'links',
      maxRows: 2,
    })
    expect(target.admin.initCollapsed).toBe(true)
  })

  it('pole ze source nahradí pole v target, nespojuje je', () => {
    const merged = deepMerge(
      { fields: [{ name: 'a' }, { name: 'b' }] },
      { fields: [{ name: 'c' }] },
    )
    expect(merged.fields).toEqual([{ name: 'c' }])
  })

  it('linkGroup s override maxRows ponechá výchozí pole a doplní limit', () => {
    const group = linkGroup({ overrides: { maxRows: 2 } })
    expect(group).toMatchObject({ name: 'links', type: 'array', maxRows: 2 })
    expect('fields' in group && group.fields).toHaveLength(1)
  })
})
