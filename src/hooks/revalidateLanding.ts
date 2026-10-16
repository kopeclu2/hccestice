import { createRevalidateHooks, type RevalidationPlan } from '@/hooks/createRevalidateHooks'
import { LANDING_CACHE_TAGS } from '@/landing/data/tags'
import { routes } from '@/lib/routes'

/**
 * Prerenderované landing stránky, které se plní z kolekcí mimo layout
 * builder.
 *
 * Dynamické routy (`/aktuality/[slug]`, `/fotogalerie/[slug]`) tu být
 * nemohou: `revalidatePath` u nich vyžaduje druhý argument a chování je
 * křehké. Pokrývá je tagová revalidace v datové vrstvě.
 *
 * `/aktuality`, `/fotogalerie` a `/zapasy` tu **záměrně nejsou**, i když
 * tu dřív byly. Čtou `searchParams`, takže jsou plně dynamické a žádnou
 * cache entry routy nemají — `revalidatePath` na nich byl no-op, který
 * budil dojem, že jsou pokryté. Pokrývají je tagy níž.
 */
const LANDING_PATHS = [routes.home, '/historie-klubu', '/soupiska', '/sponzori'] as const

/**
 * Co se přegeneruje po změně obsahu, který napájí landing (kolekce `people`,
 * `players`, `sponsors`, `milestones`, `matches`, `galleries`, `seasons`,
 * `products`, `posts` a global `siteConfig`).
 *
 * Profil `{ expire: 0 }`, ne doporučované `'max'`: `'max'` je
 * stale-while-revalidate, takže první návštěvník po uložení dostane ještě
 * starý výpis a změna se objeví až tomu dalšímu (ověřeno u režimu údržby —
 * viz `revalidateMaintenance`). U redakčního obsahu to redakce čte jako
 * „ukládání nefunguje".
 *
 * Plán je exportovaný, protože ho bez hooku volá i interní route handler
 * `/internal/revalidate`, kterým synchronizace VČHL revaliduje z cronu —
 * mimo request `revalidatePath`/`revalidateTag` padají na
 * `Invariant: static generation store missing` (`jobs/vchlSync/revalidate.ts`).
 */
export const LANDING_REVALIDATION: RevalidationPlan = {
  label: 'landing stránky',
  tags: LANDING_CACHE_TAGS,
  profile: { expire: 0 },
  paths: LANDING_PATHS,
}

/**
 * Změny home stránky samotné revaliduje `revalidatePage` hook kolekce Pages.
 *
 * Drafty (autosave) se přeskakují: landing zobrazuje jen publikovaný obsah
 * a autosave běží i BĚHEM renderu admin view, kde je `revalidatePath`
 * zakázané (Next by spadl na „used revalidatePath during render").
 *
 * Importní/seed skripty revalidaci vypínají přes
 * `context.disableRevalidate` (mimo Next runtime by spadla).
 *
 * `afterDelete` je nutný: bez něj zůstane smazaný hráč, sponzor, zápas nebo
 * galerie na landingu viditelný až do dalšího buildu — což je u stránek bez
 * ISR navždy.
 */
const hooks = createRevalidateHooks({
  ...LANDING_REVALIDATION,
  paths: () => LANDING_PATHS,
  skipDrafts: true,
})

export const revalidateLanding = hooks.afterChange
export const revalidateLandingDelete = hooks.afterDelete
