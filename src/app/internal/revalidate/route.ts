import { applyRevalidation } from '@/hooks/createRevalidateHooks'
import { LANDING_REVALIDATION } from '@/hooks/revalidateLanding'
import { TRAININGS_REVALIDATION } from '@/hooks/revalidateTrainings'
import { CACHE_TAGS } from '@/landing/data/tags'
import { hasBearerSecret } from '@/lib/bearer'

/**
 * Interní revalidace pro synchronizaci VČHL (`jobs/vchlSync/revalidate.ts`).
 *
 * Proč route handler: job běží z cronu v Node procesu Nextu, ale MIMO request,
 * takže `revalidateTag`/`revalidatePath` tam nemají `workAsyncStorage` a padají
 * na `Invariant: static generation store missing`. Uvnitř route handleru store
 * existuje. Job ho volá přes `127.0.0.1` (ne `localhost` — standalone server
 * poslouchá jen na IPv4, viz healthcheck v AGENTS.md).
 *
 * `force-dynamic`: handler nesmí být prerenderovaný; leží mimo route groupy,
 * takže nad ním není žádný `loading.tsx` ani layout.
 */
export const dynamic = 'force-dynamic'

function authorized(req: Request): boolean {
  return hasBearerSecret(req.headers.get('authorization'), process.env.CRON_SECRET)
}

export function POST(req: Request) {
  if (!authorized(req)) return new Response('Unauthorized', { status: 401 })

  // `?scope=trainings`: import tréninků (`scripts/seed/seed-trainings.ts`)
  // zapisuje s `disableRevalidate` a mimo Next runtime revalidovat nejde.
  if (new URL(req.url).searchParams.get('scope') === 'trainings') {
    applyRevalidation({ info: (msg) => console.info(`[trainings] ${msg}`) }, TRAININGS_REVALIDATION)
    return Response.json({ revalidated: true }, { headers: { 'Cache-Control': 'no-store' } })
  }

  applyRevalidation(
    { info: (msg) => console.info(`[vchl-sync] ${msg}`) },
    // Synchronizace zakládá nové zápasy (zápisy jdou s `disableRevalidate`,
    // takže hook `revalidateMatchFeeds` neběží) → nové detaily do sitemapy.
    // Feedy se invalidují `'max'` jako u ostatních crawlerských feedů.
    { ...LANDING_REVALIDATION, feeds: [CACHE_TAGS.matchesSitemap] },
  )
  return Response.json({ revalidated: true }, { headers: { 'Cache-Control': 'no-store' } })
}
