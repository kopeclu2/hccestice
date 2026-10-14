import type { Payload } from 'payload'

import type { VchlRunResult, VchlSettings } from './types'

/**
 * E-mailové upozornění po běhu (selhání v řadě, nový hráč/soupeř, přeložený
 * zápas, nový výsledek — podle `settings.notifications.notifyOn`).
 *
 * TODO (fáze 3, agent F): implementace přes `src/email/render.ts`. Funkce se
 * volá po KAŽDÉM zapsaném běhu (ne po přeskočeném, ne po nanečisto) a nesmí
 * vyhodit výjimku — `run.ts` ji stejně obaluje, ale e-mail nesmí běh shodit.
 */
export async function notifyRun(
  _payload: Payload,
  _result: VchlRunResult,
  _settings: VchlSettings,
): Promise<void> {}
