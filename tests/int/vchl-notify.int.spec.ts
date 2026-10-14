import { describe, expect, it } from 'vitest'

import { decideNotifications, type PrevRun } from '../../src/jobs/vchlSync/notify'
import { buildSubject, renderVchlSyncEmail } from '../../src/email/templates/vchlSync'
import { emptyChanges, type VchlRunResult } from '../../src/jobs/vchlSync/types'

const settings = (over: Partial<{ notifyOn: string[]; failureThreshold: number }> = {}) => ({
  notifications: {
    notifyOn: ['failure', 'new-entity', 'rescheduled', 'result'],
    recipients: [],
    failureThreshold: 2,
    ...over,
  },
})

const run = (status: VchlRunResult['status'], over: Partial<VchlRunResult> = {}) => ({
  status,
  warnings: [],
  error: undefined,
  playedNow: undefined,
  changes: emptyChanges(),
  ...over,
})

const prev = (status: string, warnings: PrevRun['warnings'] = []): PrevRun => ({ status, warnings })

describe('vchl notifikace: selhání', () => {
  it('první selhání pod prahem nic neposílá', () => {
    expect(decideNotifications([prev('ok')], run('error', { error: 'x' }), settings())).toBeNull()
  })

  it('přesně při dosažení prahu pošle, s textem chyby', () => {
    const plan = decideNotifications([prev('error'), prev('ok')], run('error', { error: 'AHL 503' }), settings())
    expect(plan?.failure).toEqual({ streak: 2, status: 'error', error: 'AHL 503' })
  })

  it('další selhání nad prahem už neposílá (jinak 96 mailů denně)', () => {
    const history = [prev('error'), prev('error'), prev('error'), prev('ok')]
    expect(decideNotifications(history, run('error'), settings())).toBeNull()
  })

  it('partial se do série počítá', () => {
    const plan = decideNotifications([prev('partial')], run('error'), settings())
    expect(plan?.failure?.streak).toBe(2)
  })

  it('práh 1 hlásí první selhání, ne druhé', () => {
    expect(decideNotifications([prev('ok')], run('error'), settings({ failureThreshold: 1 }))?.failure).toBeTruthy()
    expect(decideNotifications([prev('error')], run('error'), settings({ failureThreshold: 1 }))).toBeNull()
  })

  it('obnovení po sérii ≥ práh', () => {
    const plan = decideNotifications([prev('error'), prev('error'), prev('error'), prev('ok')], run('ok'), settings())
    expect(plan?.recovered).toEqual({ after: 3 })
  })

  it('obnovení se neposílá po sérii kratší než práh (upozornění na selhání nikdy neodešlo)', () => {
    expect(decideNotifications([prev('error'), prev('ok')], run('ok'), settings())).toBeNull()
  })

  it('bez „failure" v notifyOn se o selhání mlčí', () => {
    const s = settings({ notifyOn: ['new-entity'] })
    expect(decideNotifications([prev('error')], run('error'), s)).toBeNull()
    expect(decideNotifications([prev('error'), prev('error')], run('ok'), s)).toBeNull()
  })

  it('přeskočený běh nic neposílá', () => {
    expect(decideNotifications([], run('skipped'), settings())).toBeNull()
  })
})

describe('vchl notifikace: entity, přeložení, výsledky', () => {
  const w = (type: string, ref: string, message = `${type} ${ref}`) => ({ type: type as never, ref, message })

  it('nový hráč a soupeř jen když nebyl v předchozím běhu', () => {
    const current = run('ok', { warnings: [w('unknown-player', '38010'), w('unknown-opponent', 'Skuteč'), w('ambiguous-player', '5')] })
    const plan = decideNotifications([prev('ok', [{ type: 'unknown-player', ref: '38010' }])], current, settings())
    expect(plan?.newPlayers).toHaveLength(0)
    expect(plan?.newOpponents).toHaveLength(1)
    expect(plan?.ambiguousPlayers).toHaveLength(1)
  })

  it('stejný nejednoznačný hráč v řadě běhů se hlásí jen jednou', () => {
    const current = run('ok', { warnings: [w('ambiguous-player', '5')] })
    expect(decideNotifications([prev('ok', [{ type: 'ambiguous-player', ref: '5' }])], current, settings())).toBeNull()
  })

  it('přeložený zápas: nové znění se hlásí, stejné ne', () => {
    const a = w('rescheduled', '1', 'Zápas přeložen: A → B')
    const b = w('rescheduled', '1', 'Zápas přeložen: B → C')
    expect(decideNotifications([prev('ok', [a])], run('ok', { warnings: [a] }), settings())).toBeNull()
    expect(decideNotifications([prev('ok', [a])], run('ok', { warnings: [b] }), settings())?.rescheduled).toHaveLength(1)
  })

  it('výsledek jen s „result" v notifyOn', () => {
    const playedNow = [{ matchId: 1, label: '2026-10-04 doma Pardubice', score: '5:6 sn' }]
    expect(decideNotifications([], run('ok', { playedNow }), settings())?.results).toEqual(playedNow)
    expect(decideNotifications([], run('ok', { playedNow }), settings({ notifyOn: ['failure'] }))).toBeNull()
  })

  it('bez událostí nic', () => {
    expect(decideNotifications([prev('ok')], run('ok'), settings())).toBeNull()
  })

  it('jeden plán, víc sekcí v jednom e-mailu', () => {
    const current = run('ok', {
      warnings: [w('unknown-player', '1'), w('unknown-player', '2'), w('rescheduled', '9', 'Zápas přeložen: A → B')],
    })
    const plan = decideNotifications([], current, settings())!
    expect(buildSubject(plan)).toBe('Synchronizace VČHL: 2 noví hráči, 1 přeložený zápas')
  })
})

describe('vchl notifikace: šablona', () => {
  it('html i text, odkazy do adminu, escapování', () => {
    const plan = decideNotifications(
      [],
      run('ok', {
        warnings: [{ type: 'unknown-player', ref: '38010', message: 'Hráč „A <b>" nebyl v CMS' }],
        playedNow: [{ matchId: 1, label: '2026-10-04 doma Pardubice', score: '5:6 sn' }],
      }),
      settings(),
    )!
    const { subject, html, text } = renderVchlSyncEmail(plan, () => 'http://x/admin/collections/players/7')
    expect(subject).toBe('Synchronizace VČHL: 1 nový hráč, 1 nový výsledek')
    expect(html).toContain('/admin/vchl-sync')
    expect(html).toContain('A &lt;b&gt;')
    expect(html).not.toContain('<b>"')
    expect(text).toContain('http://x/admin/collections/players/7')
    expect(text).toContain('/admin/vchl-sync')
    expect(text).toContain('2026-10-04 doma Pardubice — 5:6 sn')
    expect(text).toContain('„A <b>"')
  })
})
