import type { PayloadRequest } from 'payload'

import type { Opponent } from '../payload-types'

/** Relace `matches.opponent`: ID, populovaný dokument, nebo nic (částečný update). */
export type OpponentRef = number | { id: number } | null | undefined

type Memo = Map<number, Promise<Opponent | null>>

/**
 * Paměť vázaná na `req`: slug i titulek zápasu potřebují stejného soupeře
 * a dřív si ho každý hook načítal zvlášť (dva `findByID` na jedno uložení).
 * `req.context` se k tomu nehodí — seed skript ho předává sdílený napříč
 * operacemi, takže by paměť přežila uložení a další zápas dostal soupeře
 * z minulého (zastaralého) čtení. `req` žije jednu operaci a WeakMap ho
 * pustí s ní.
 */
const MEMOS = new WeakMap<PayloadRequest, Memo>()

const memoOf = (req: PayloadRequest): Memo => {
  const existing = MEMOS.get(req)
  if (existing) return existing
  const created: Memo = new Map()
  MEMOS.set(req, created)
  return created
}

/**
 * Soupeř zápasu pro hooky, které skládají titulek a adresu. Chybějící nebo
 * neexistující soupeř je `null` — hooky mají záložní hodnotu, uložení zápasu
 * nesmí spadnout na smazaném soupeři.
 *
 * `req` se předává dál, aby čtení běželo ve stejné transakci jako zápis.
 */
export const resolveOpponent = (
  req: PayloadRequest,
  ref: OpponentRef,
): Promise<Opponent | null> => {
  const id = typeof ref === 'object' && ref ? ref.id : ref
  if (id == null) return Promise.resolve(null)

  const memo = memoOf(req)
  const cached = memo.get(id)
  if (cached) return cached

  const loaded = req.payload
    .findByID({ collection: 'opponents', id, depth: 0, req })
    .catch((): null => null)
  memo.set(id, loaded)
  return loaded
}
