import { slugField } from 'payload'
import type { Field, FieldHook } from 'payload'
import { describe, expect, it } from 'vitest'

import { slugFieldCs } from '@/fields/slugCs'
import { slugifyCs } from '@/lib/slugifyCs'

type Row = {
  fields: (Field & { custom?: { slugify?: unknown }; hooks?: { beforeChange?: FieldHook[] } })[]
}

const row = (field: Field) => field as unknown as Row
const [checkbox, slug] = row(slugFieldCs()).fields

describe('slugFieldCs', () => {
  it('diakritiku převádí, nezahazuje (výchozí slugify Payloadu ano)', () => {
    const slugify = slug.custom?.slugify as (args: { valueToSlugify: unknown }) => string
    expect(slugify({ valueToSlugify: 'Rozhovor s trenérem' })).toBe('rozhovor-s-trenerem')
    expect(slugify({ valueToSlugify: 'HC Žďár' })).toBe('hc-zdar')
    expect(slugify({ valueToSlugify: 42 })).toBeUndefined()
  })

  it('schéma pole je stejné jako u výchozího slugField (mění se jen funkce)', () => {
    // JSON zahodí funkce — porovnává se tedy všechno kromě `slugify`.
    expect(JSON.stringify(slugFieldCs())).toBe(JSON.stringify(slugField()))
    expect(JSON.stringify(slugFieldCs({ useAsSlug: 'name' }))).toBe(
      JSON.stringify(slugField({ useAsSlug: 'name' })),
    )
  })

  it('už uložený slug zůstane stejný: slugifyCs je na slugu idempotentní', () => {
    for (const existing of [
      'nove-posily-2024-25',
      'rozhovor-s-trenerem',
      'hc-policka-b-x-hc-cestice',
      '2025-10-12-hc-zdar',
    ]) {
      expect(slugifyCs(existing)).toBe(existing)
    }
  })

  it('create: ručně zadaný slug se zachová, prázdný se vygeneruje z titulku', async () => {
    const hook = checkbox.hooks!.beforeChange![0]
    const run = (data: Record<string, unknown>, operation: 'create' | 'update', value: boolean) =>
      hook({ data, operation, value } as unknown as Parameters<FieldHook>[0])

    const manual = { slug: 'stary-slug', title: 'Rozhovor s trenérem' }
    await run(manual, 'create', true)
    expect(manual.slug).toBe('stary-slug')

    const generated: Record<string, unknown> = { title: 'Rozhovor s trenérem' }
    await run(generated, 'create', true)
    expect(generated.slug).toBe('rozhovor-s-trenerem')
  })

  it('update s vypnutým generováním slug nepřepíše', async () => {
    const hook = checkbox.hooks!.beforeChange![0]
    const data = { slug: 'uz-publikovano', title: 'Úplně jiný titulek' }
    await hook({ data, operation: 'update', value: false } as unknown as Parameters<FieldHook>[0])
    expect(data.slug).toBe('uz-publikovano')
  })
})
