import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { parseMatchDetail } from '../../src/ahl'
import {
  buildDraftContent,
  draftSlug,
  draftTitle,
  ourGoalsLine,
  periodsLabel,
  scoreLabel,
} from '../../src/jobs/vchlSync/sync/draftPost'
import { ourSide } from '../../src/jobs/vchlSync/sync/matchDetail'

const fx = (name: string) => readFileSync(path.resolve(import.meta.dirname, '../fixtures/ahl', name), 'utf8')
const detail = parseMatchDetail(fx('zapas-46616.html'), 46616)

type Node = { type: string; children?: Node[]; text?: string; format?: number | string }
const plain = (n: Node): string => n.text ?? (n.children ?? []).map(plain).join('')

describe('vchl koncept reportáže', () => {
  it('Čestice jsou v zápase 46616 domácí', () => {
    expect(ourSide(detail)).toBe('home')
  })

  it('titulek v pořadí domácí–hosté se skóre a příponou', () => {
    expect(scoreLabel(detail)).toBe('5:6 sn')
    expect(draftTitle('Pardubice', true, detail)).toBe('HC Čestice – Pardubice 5:6 sn')
    expect(draftTitle('Pardubice', false, detail)).toBe('Pardubice – HC Čestice 5:6 sn')
  })

  it('slug bez diakritiky: datum a soupeř', () => {
    expect(draftSlug('2026-10-04', 'Divočáci Žamberk')).toBe('2026-10-04-divocaci-zamberk')
    expect(draftSlug('2026-10-04', '???')).toBe('2026-10-04')
  })

  it('třetiny z period zápisu', () => {
    expect(periodsLabel(detail)).toBe('0:0, 3:1, 2:4')
  })

  it('řádek našich branek: čas, střelec, asistence; nájezd slovy', () => {
    const line = ourGoalsLine(detail, 'home')
    expect(line).toContain('Lukáš Sajdl')
    // rozhodující nájezd (60:00) dal soupeř, takže u naší strany není
    expect(line).not.toContain('nájezd')
    expect(ourGoalsLine(detail, 'away')).toContain('nájezd')
    // soupeřovy branky tam nepatří
    expect(line).not.toContain('Roman Fuks')
    expect(line).toContain('30:41 Lukáš Sajdl (Vojtěch Kapucián, Radim Sajdl) 5/4')
  })

  it('Lexical: root, tři odstavce, tučný štítek, placeholder na konci', () => {
    const c = buildDraftContent(detail, 'home', 'Pardubice', true) as unknown as { root: Node & { direction: string } }
    expect(c.root.type).toBe('root')
    expect(c.root.children).toHaveLength(3)
    const [result, goals, todo] = c.root.children!
    expect(plain(result)).toBe('Výsledek: HC Čestice – Pardubice 5:6 sn (0:0, 3:1, 2:4).')
    expect(plain(goals)).toMatch(/^Branky Čestic: /)
    expect(result.children![0]).toMatchObject({ type: 'text', format: 1, version: 1 })
    expect(plain(todo)).toBe('Doplňte text reportáže…')
    for (const p of c.root.children!) expect(p).toMatchObject({ type: 'paragraph', version: 1, direction: 'ltr' })
  })

  it('bez našich branek to řekne slovy', () => {
    const none = { ...detail, goals: detail.goals.filter((g) => g.side === 'away') }
    expect(ourGoalsLine(none, 'home')).toBe('naše strana branku nevstřelila.')
  })
})
