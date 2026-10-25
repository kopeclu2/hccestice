import { createRevalidateHooks, type RevalidationPlan } from '@/hooks/createRevalidateHooks'
import { CACHE_TAGS } from '@/landing/data/tags'

/**
 * Změna termínu tréninku → okamžitě expiruje výpis (`trainings-list`),
 * který čte home sekce i `/treninky`. Profil `{ expire: 0 }`, ne `'max'`:
 * redakční obsah, první návštěvník po uložení nesmí vidět starý rozpis.
 *
 * Bez `revalidatePath`: tag se propaguje i do prerenderovaných stránek
 * (home, `/treninky`), takže stačí. Seed
 * a importy posílají `context.disableRevalidate` (řeší továrna).
 */
export const TRAININGS_REVALIDATION: Omit<RevalidationPlan, 'paths'> = {
  label: 'tréninky',
  tags: [CACHE_TAGS.trainings],
  profile: { expire: 0 },
}

const hooks = createRevalidateHooks(TRAININGS_REVALIDATION)

export const revalidateTrainings = hooks.afterChange
export const revalidateTrainingsDelete = hooks.afterDelete
