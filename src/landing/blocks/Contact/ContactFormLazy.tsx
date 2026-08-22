'use client'

import dynamic from 'next/dynamic'
import React from 'react'

/**
 * Kontaktní formulář se načítá až při přiblížení k viewportu.
 *
 * `ContactForm` táhne `react-hook-form` + `zod` + `@hookform/resolvers` —
 * dohromady největší chunk celého webu (~80 kB gzip). Sedí přitom až na konci
 * homepage, hluboko pod foldem, takže drtivá většina návštěvníků ten kód
 * stáhne a nikdy nepoužije.
 *
 * `dynamic()` je volané **uvnitř `'use client'` modulu** — jen tak vznikne
 * skutečně líná hranice. Z Server Componenty by neudělalo nic
 * (`node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:60`),
 * což je past, na které v tomhle repu ztroskotal dřívější pokus
 * s `LivePreviewListener`.
 *
 * Rozměry placeholderu nejsou odhad: formulář byl změřen v prohlížeči na
 * 575 px (390px viewport) a 467 px (1440px). K tomu 40 px jeho vlastního
 * `mt-10` → 616 a 508 px. Díky tomu je CLS při dosazení formuláře nulové,
 * což je podmínka — web má dnes CLS 0 a nesmí o to přijít.
 *
 * `flow-root` je tu kvůli slučování margin: bez něj by `mt-10` formuláře
 * proteklo ven z obalu a `min-h` by měřilo něco jiného než ve výsledku.
 */
const ContactForm = dynamic(() => import('./ContactForm').then((mod) => mod.ContactForm))

export function ContactFormLazy({ topics }: { topics: string[] }) {
  const anchor = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = anchor.current
    if (!el) return

    // Bez IntersectionObserveru (starší prohlížeč) radši formulář rovnou
    // zobrazit — nefunkční kontakt je horší než chunk navíc.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      // Náskok, aby byl formulář stažený dřív, než na něj uživatel dojede.
      { rootMargin: '400px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flow-root min-h-154 md:min-h-127" ref={anchor}>
      {visible && <ContactForm topics={topics} />}
    </div>
  )
}
