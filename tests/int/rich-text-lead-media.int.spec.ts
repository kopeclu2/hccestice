import { describe, expect, it } from 'vitest'

import { findLeadMediaBlockId } from '@/components/RichText/leadMedia'

const paragraph = { type: 'paragraph' }
const media = (id: string) => ({ type: 'block', fields: { id, blockType: 'mediaBlock' } })
const youtube = (id: string) => ({ type: 'block', fields: { id, blockType: 'youtube' } })
const doc = (...children: unknown[]) => ({ root: { children } })

describe('findLeadMediaBlockId', () => {
  it('vrátí id prvního obrázku, když je mezi prvními uzly', () => {
    expect(findLeadMediaBlockId(doc(paragraph, media('a'), media('b')))).toBe('a')
    expect(findLeadMediaBlockId(doc(media('a')))).toBe('a')
  })

  it('obrázek až za úvodem (4. uzel a dál) není LCP kandidát', () => {
    expect(findLeadMediaBlockId(doc(paragraph, paragraph, paragraph, media('a')))).toBeUndefined()
  })

  it('jiné bloky než mediaBlock ignoruje, ale jejich pozice se počítá', () => {
    expect(findLeadMediaBlockId(doc(youtube('y'), media('a')))).toBe('a')
    expect(findLeadMediaBlockId(doc(youtube('y'), youtube('z')))).toBeUndefined()
  })

  it('prázdný nebo chybějící obsah nehodí výjimku', () => {
    expect(findLeadMediaBlockId(doc())).toBeUndefined()
    expect(findLeadMediaBlockId({})).toBeUndefined()
  })

  it('blok bez id neprosákne jako prázdný řetězec', () => {
    expect(
      findLeadMediaBlockId(doc({ type: 'block', fields: { blockType: 'mediaBlock' } })),
    ).toBeUndefined()
  })
})
