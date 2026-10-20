import { describe, expect, it } from 'vitest'

import { descriptionFromBody, lexicalRootText, stripEmoji } from '@/lib/plainText'
import type { Page, Post } from '@/payload-types'

const text = (value: string) => ({ type: 'text', text: value, version: 1 })
const paragraph = (...children: ReturnType<typeof text>[]) => ({
  type: 'paragraph',
  children,
  version: 1,
})
const lexical = (...children: ReturnType<typeof paragraph>[]): NonNullable<Post['content']> => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

const PROSE =
  'Hokejisté Čestic v neděli přivítali na domácím ledě soupeře z Poličky. Zápas rozhodla třetí třetina. Diváci viděli šest gólů.'

describe('stripEmoji', () => {
  it('odstraní emoji, vlajky i sekvence se ZWJ a slije mezery', () => {
    expect(stripEmoji('Hrajeme 🏒 doma 🇨🇿 a 👍🏽 vyhráváme ⚡')).toBe('Hrajeme doma a vyhráváme')
    expect(stripEmoji('👨‍👩‍👧 Rodina')).toBe('Rodina')
  })

  it('ponechá typografii a symboly firem', () => {
    expect(stripEmoji('HC Čestice © 2026 — 2×3 → 5 °C™')).toBe('HC Čestice © 2026 — 2×3 → 5 °C™')
  })
})

describe('lexicalRootText', () => {
  it('odstavce odděluje mezerou', () => {
    const out = lexicalRootText(lexical(paragraph(text('První.')), paragraph(text('Druhá.'))))
    expect(out.replace(/\s+/g, ' ').trim()).toBe('První. Druhá.')
  })

  it('null a prázdný strom je prázdný text', () => {
    expect(lexicalRootText(null)).toBe('')
    expect(lexicalRootText(undefined)).toBe('')
    expect(lexicalRootText(lexical())).toBe('')
  })
})

describe('descriptionFromBody', () => {
  it('lexical tělo článku', () => {
    const out = descriptionFromBody({
      title: 'Jiný titulek',
      content: lexical(paragraph(text(PROSE))),
    })
    expect(out).toBe(PROSE)
  })

  it('dlouhé tělo ořízne na hranici věty do 160 znaků', () => {
    const long = Array.from(
      { length: 12 },
      (_, i) => `Věta číslo ${i + 1} je docela dlouhá a nese informaci.`,
    ).join(' ')
    const out = descriptionFromBody({ title: 'x', content: lexical(paragraph(text(long))) })
    expect(out.length).toBeLessThanOrEqual(160)
    expect(out.endsWith('.')).toBe(true)
  })

  it('legacyHtml: tagy, entity a dvojí escapování', () => {
    const out = descriptionFromBody({
      title: 'Titulek',
      contentType: 'html',
      legacyHtml: `<p><span style="color:red">Hokejist&eacute; &Ccaron;estic v ned&ecaron;li p&rcaron;iv&iacute;tali soupe&rcaron;e z Poli&ccaron;ky.</span></p><p>Z&aacute;pas rozhodla t&rcaron;et&iacute; t&rcaron;etina.</p>`,
    })
    expect(out).toBe(
      'Hokejisté Čestic v neděli přivítali soupeře z Poličky. Zápas rozhodla třetí třetina.',
    )
  })

  it('contentType html s prázdným legacyHtml spadne na lexical a naopak', () => {
    expect(
      descriptionFromBody({
        title: 'x',
        contentType: 'html',
        legacyHtml: '',
        content: lexical(paragraph(text(PROSE))),
      }),
    ).toBe(PROSE)
    expect(
      descriptionFromBody({
        title: 'x',
        contentType: 'richText',
        content: lexical(),
        legacyHtml: `<p>${PROSE}</p>`,
      }),
    ).toBe(PROSE)
  })

  it('emoji se z popisku odstraní', () => {
    const out = descriptionFromBody({
      title: 'x',
      content: lexical(
        paragraph(
          text('🏒 Hokejisté Čestic v neděli vyhráli 4:2 nad Poličkou ⚡ a poskočili v tabulce.'),
        ),
      ),
    })
    expect(out).toBe('Hokejisté Čestic v neděli vyhráli 4:2 nad Poličkou a poskočili v tabulce.')
  })

  it('úvodní věta opakující titulek se přeskočí', () => {
    const out = descriptionFromBody({
      title: 'HC Čestice x TJ Voděrady',
      content: lexical(paragraph(text(`HC Čestice x TJ Voděrady. ${PROSE}`))),
    })
    expect(out).toBe(PROSE)
  })

  it('tabulka a rozpis popisek nedají', () => {
    const out = descriptionFromBody({
      title: 'Rozpis',
      legacyHtml:
        '<table><tr><td>9:00</td><td>10:00</td><td>11:00</td><td>Po</td><td>6.2.</td></tr></table>',
    })
    expect(out).toBe('')
  })

  it('stránka: bere textSection a rawHtml, ostatní bloky přeskočí', () => {
    const layout = [
      { blockType: 'landingClub', headlineStart: 'Krátký nadpis' },
      { blockType: 'textSection', content: lexical(paragraph(text(PROSE))) },
      { blockType: 'rawHtml', html: '<p>Druhý blok nic nezmění, protože se vejde jen první.</p>' },
    ] as unknown as Page['layout']
    expect(descriptionFromBody({ title: 'Kontakty', layout })).toBe(PROSE)
  })

  it('stránka bez textových bloků a prázdný dokument', () => {
    expect(descriptionFromBody({ title: 'x', layout: [] })).toBe('')
    expect(descriptionFromBody({})).toBe('')
  })
})
