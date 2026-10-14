import type { Payload } from 'payload'

import type { AhlMatchDetail } from '@/ahl'
import type { Match } from '@/payload-types'

import type { SyncContext } from './ctx'

/**
 * Koncept reportáže po zápase (`_status: 'draft'`, vazba `match`).
 *
 * TODO (fáze 3, agent F): implementace. Vrací true, když koncept vznikl —
 * `run.ts` pak nastaví `ahl.draftPostCreated`, aby se smazaný koncept při
 * dalším běhu nezaložil znovu. Volá se jen mimo nanečisto a jen pro zápas,
 * který se v tomto běhu poprvé dostal do stavu „odehráno se zápisem".
 */
export async function createDraftPost(
  _payload: Payload,
  _matchDoc: Match,
  _detail: AhlMatchDetail,
  _ctx: SyncContext,
): Promise<boolean> {
  return false
}
