import { fetchNavCta, fetchNavigation } from '@/landing/features/navigation/data'
import { SiteNav } from '@/landing/layout/SiteNav'

/**
 * Globální navigace podstránek: bílá karta (`SiteNav`) v toku stránky nad
 * obsahem. Aktivní odkaz si karta určuje sama z `usePathname()`, takže
 * volající nemusí předávat nic.
 */
export async function ArticleNav() {
  const [items, cta] = await Promise.all([fetchNavigation(), fetchNavCta()])
  return <SiteNav cta={cta} items={items} />
}
