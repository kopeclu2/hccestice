import { describe, expect, it } from 'vitest'

import {
  htmlWordCount,
  lexicalPlainText,
  lexicalWordCount,
  readingLabel,
} from '@/landing/features/posts/view/text'
import type { Post } from '@/payload-types'

const text = (value: string, format = 0) => ({
  type: 'text',
  text: value,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const paragraph = (...children: ReturnType<typeof text>[]) => ({
  type: 'paragraph',
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})

const content = (...children: ReturnType<typeof paragraph>[]): NonNullable<Post['content']> => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

describe('lexicalPlainText', () => {
  it('odstavce odděluje prázdným řádkem', () => {
    const body = content(paragraph(text('První odstavec.')), paragraph(text('Druhý odstavec.')))
    expect(lexicalPlainText(body)).toBe('První odstavec.\n\nDruhý odstavec.')
  })

  it('navazující úseky (tučné slovo uprostřed věty) spojuje bez mezery', () => {
    const body = content(
      paragraph(text('Vyhráli jsme '), text('5:2', 1), text(' nad Lanškrounem.')),
    )
    expect(lexicalPlainText(body)).toBe('Vyhráli jsme 5:2 nad Lanškrounem.')
    expect(lexicalWordCount(body)).toBe(5)
  })

  it('prázdný, chybějící i prázdný odstavec dají prázdný text', () => {
    expect(lexicalPlainText(null)).toBe('')
    expect(lexicalPlainText(undefined)).toBe('')
    expect(lexicalPlainText(content(paragraph(text(''))))).toBe('')
    expect(lexicalWordCount(null)).toBe(0)
  })
})

describe('počet slov a doba čtení', () => {
  it('htmlWordCount ignoruje tagy', () => {
    expect(htmlWordCount('<p>Dnes <b>hrajeme</b></p><p>doma</p>')).toBe(3)
  })

  it('readingLabel: 200 slov za minutu, minimálně jedna', () => {
    expect(readingLabel(0)).toBe('1 min čtení')
    expect(readingLabel(400)).toBe('2 min čtení')
  })
})
