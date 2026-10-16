import { createRevalidateHooks } from '@/hooks/createRevalidateHooks'
import { CACHE_TAGS } from '@/landing/data/tags'

/**
 * Přepínač režimu údržby platí pro **celý** veřejný web — včetně detailů
 * článků, galerií a produktů, které jsou prerenderované a `revalidatePath`
 * je u nich nepoužitelný (viz `revalidateLanding`). Proto tag, ne cesty:
 * z `unstable_cache` se propaguje i na build-time prerender, takže jedno
 * zavolání pokryje všechno.
 *
 * Bez tohohle hooku by přepnutí v adminu nezabralo vůbec — `unstable_cache`
 * bez `options.revalidate` má TTL jeden rok. Není to optimalizace, ale
 * podmínka funkčnosti.
 *
 * Profil je `{ expire: 0 }`, **ne doporučované `'max'`**: `'max'` znamená
 * stale-while-revalidate, takže hned po zapnutí režimu dostane první
 * návštěvník ještě starou (běžnou) stránku a údržba se objeví až tomu
 * dalšímu. U vypínače webu je to chyba, ne kompromis. `updateTag()` by
 * expiroval okamžitě taky, ale jde volat jen ze Server Action — admin
 * ukládá přes REST route handler, kde vyhodí `E872`.
 */
export const revalidateMaintenance = createRevalidateHooks({
  label: 'režim údržby',
  tags: [CACHE_TAGS.maintenance],
  profile: { expire: 0 },
}).afterChange
