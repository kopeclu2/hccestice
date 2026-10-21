import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { mediaBlockConverter, type MediaOptions } from '@/components/RichText'
import { findLeadMediaBlockId } from '@/components/RichText/leadMedia'
import type { MediaBlock as MediaBlockProps } from '@/payload-types'

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

describe('mediaBlockConverter', () => {
  const node = (id: string) =>
    ({
      type: 'block',
      version: 2,
      format: '',
      fields: {
        id,
        blockType: 'mediaBlock',
        media: {
          id: 1,
          url: '/api/media/file/a.jpg',
          width: 1200,
          height: 800,
          updatedAt: '2026-01-01T00:00:00.000Z',
          alt: '',
        },
      },
    }) as unknown as SerializedBlockNode<MediaBlockProps>
  const render = (id: string, options: MediaOptions) =>
    renderToStaticMarkup(mediaBlockConverter(options)({ node: node(id) }))

  it('úvodní obrázek je eager s fetchPriority high a vlastním sizes', () => {
    const html = render('a', { mediaSizes: '94vw', priorityMediaId: 'a' })
    expect(html).toContain('loading="eager"')
    expect(html).toContain('fetchPriority="high"')
    expect(html).toContain('sizes="94vw"')
  })

  it('ostatní obrázky zůstávají lazy bez priority', () => {
    const html = render('b', { mediaSizes: '94vw', priorityMediaId: 'a' })
    expect(html).toContain('loading="lazy"')
    expect(html).not.toContain('fetchPriority')
  })

  it('bez options platí původní chování (lazy, 100vw)', () => {
    const html = render('a', {})
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('sizes="100vw"')
  })
})
