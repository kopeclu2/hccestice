import * as Sentry from '@sentry/nextjs'
import type { TaskConfig } from 'payload'

import { TZ } from '@/lib/datetime'

// Frekvence cronu je v Payloadu statická (`schedule.cron` v configu), ale
// správce chce měnit interval z adminu bez redeploye. Proto cron tiká pevně
// každých 5 minut a o tom, jestli se opravdu synchronizuje, rozhoduje
// `runVchlSync` podle globalu `vchl-sync` (zapnuto / zápasový vs klidový
// režim / zda je běh na řadě).
//
// Formát cronu: Croner bere 5 i 6 polí; u 6 polí je první VTEŘINA. Proto
// `0 */5 * * * *` (vteřina 0, každých 5 minut) — ne `* */5 * * * *`, které
// by běželo každou vteřinu každé páté minuty. Stejný výraz jde do `autoRun`
// v `payload.config.ts` (fronta `vchl`).
//
// Plánování nezakládá víc instancí: výchozí `beforeSchedule` nepřidá job,
// dokud v téže frontě čeká nebo běží jiný job téhož tasku
// (`handleSchedules/defaultBeforeSchedule`), a `deleteJobOnComplete` (výchozí
// `true`) odehraný job smaže — `payload-jobs` tedy neroste.
//
export const VCHL_QUEUE = 'vchl'
export const VCHL_CRON = '0 */5 * * * *'

export const vchlSyncTask: TaskConfig<{
  input: Record<string, never>
  output: { status: string; skippedReason?: string; mode: string; runId?: string; requests: number }
}> = {
  slug: 'vchlSync',
  label: 'Synchronizace VČHL z AHL.cz',
  retries: 0,
  schedule: [{ cron: VCHL_CRON, queue: VCHL_QUEUE }],
  outputSchema: [
    { name: 'status', type: 'text' },
    { name: 'skippedReason', type: 'text' },
    { name: 'mode', type: 'text' },
    { name: 'runId', type: 'text' },
    { name: 'requests', type: 'number' },
  ],
  handler: async ({ req }) => {
    // Dynamicky: `run` tahá jsdom (parsery AHL) a task.ts se importuje
    // z `payload.config.ts`, tedy při každém načtení configu včetně admina.
    const { runVchlSync } = await import('./run')
    // Check-in jde z KAŽDÉHO tiku, i toho, který nic nedělá. Monitor tak
    // hlídá hlavní riziko — že plánovač vůbec neběží (crony po deployi se samy
    // nespustí, viz `startCrons.ts`) — a nezávisí na `enabled`, takže vypnutí
    // synchronizace v adminu nespustí falešný poplach „missed check-in".
    const result = await Sentry.withMonitor(
      'vchl-sync-tick',
      () => runVchlSync(req.payload, { trigger: 'cron' }),
      {
        schedule: { type: 'crontab', value: '*/5 * * * *' },
        checkinMargin: 5,
        maxRuntime: 10,
        timezone: TZ,
      },
    )
    // Výstup je malý záměrně — celý diff a varování žijí v `vchl-sync-runs`.
    return {
      output: {
        status: result.status,
        skippedReason: result.skippedReason,
        mode: result.mode,
        runId: result.runId != null ? String(result.runId) : undefined,
        requests: result.requests,
      },
    }
  },
}
