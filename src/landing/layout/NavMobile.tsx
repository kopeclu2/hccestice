'use client'

import { Menu } from 'lucide-react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'
import type { NavItem } from '@/landing/features/navigation/types'
import { cn } from '@/lib/utils'

const loadPanel = () => import('./NavMobilePanel')

/**
 * Panel (Radix Dialog + obsah menu) je líný chunk. `dynamic()` je volané
 * v `'use client'` modulu, jen tak vznikne skutečná hranice — ze Server
 * Componenty by nic neštěpilo (viz `ContactFormLazy`). `loadPanel` sdílí
 * s přednačtením z burgeru, takže se `import()` dedupuje.
 */
const NavMobilePanel = dynamic(() => loadPanel().then((mod) => mod.NavMobilePanel), {
  ssr: false,
})

/**
 * Mobilní navigace — burger tlačítko a přes celou obrazovku rozbalený
 * seznam odkazů. Do `nav` (1440px) je jediná navigace, kterou uživatel má
 * (desktopové pilulky jsou `hidden nav:flex` — deset položek se vejde vedle
 * loga a CTA až od 1440px, viz `NavPills`).
 *
 * Burger se vykreslí hned a nese ARIA, kterou by jinak dodal Radix trigger
 * (`aria-expanded`, `aria-haspopup`, `aria-controls`). Panel se stáhne při
 * prvním najetí nebo zaostření na burger, nejpozději při kliknutí; dokud se
 * menu neotevře, panel se nemontuje vůbec. Po prvním otevření zůstane
 * namontovaný, aby Radix stihl zavírací animaci a vrátil fokus.
 *
 * `context` rozhoduje o cílech odkazů — na homepage kotvy, na
 * podstránkách cesty (viz `navHref`).
 */
export function NavMobile({
  items,
  ctaHref,
  ctaLabel,
  context,
  tone = 'light',
  always = false,
}: {
  items: NavItem[]
  /** Bez `ctaHref`/`ctaLabel` je overlay jen seznam odkazů (hero varianta 2
   *  umí tlačítko v navigaci v CMS vypnout). */
  ctaHref?: string
  ctaLabel?: string
  context: 'home' | 'subpage'
  /** `glass` = přes hero fotku, `light` = na světlé navigaci podstránek. */
  tone?: 'glass' | 'light'
  /**
   * Burger i na desktopu. Hero varianta 2 do pilulek pustí jen část odkazů
   * (logo uprostřed sebere šířku), takže menu je tam jediná cesta ke zbytku
   * — na velkých obrazovkách stejně jako na malých.
   */
  always?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  // Panel se montuje při prvním otevření a pak už zůstává (zavírací animace).
  const [mounted, setMounted] = React.useState(false)
  const pathname = usePathname()
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const panelId = React.useId()

  // Zavřít při přechodu na jinou stránku. U kotev na téže stránce se
  // pathname nemění, proto navíc onClick na položkách. Nastavuje se přímo
  // v renderu (ne v efektu) — doporučený způsob, jak odvodit stav ze změny
  // propu/route bez zbytečného extra renderu.
  const [prevPathname, setPrevPathname] = React.useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setOpen(false)
  }

  // Panel je od `nav` skrytý (`nav:hidden`) a s ním i burger. Když okno
  // přeroste hranici při otevřeném menu, Radix by dál držel zámek scrollu
  // a `aria-hidden` na zbytku stránky, přestože na panel nikdo nevidí.
  // Zmizení burgeru (`display: none`) je signál, že se menu má zavřít — tak
  // se nemusí opisovat číslo breakpointu `nav` z CSS.
  React.useEffect(() => {
    const trigger = triggerRef.current
    if (!open || always || !trigger) return

    const observer = new ResizeObserver(() => {
      if (trigger.offsetParent === null) setOpen(false)
    })
    observer.observe(trigger)
    return () => observer.disconnect()
  }, [always, open])

  return (
    <>
      {/*
       * `size="circle"` (44px mobil, 40px desktop): burger je do `nav` jediná
       * cesta k navigaci, takže 40px tap target byl pod hranicí 44px, kterou
       * kvůli témuž pravidlu drží všechny pilulky (`components/ui/button`).
       *
       * Skleněná varianta má `bg-pine-deep/32` a `border-on-contrast-ghost`, ne
       * `bg-on-contrast-glass` s `border-on-contrast-line`. Bílá průsvitka na bílé bílou
       * ikonu ani hranu tlačítka od světlé části hero fotky (konstrukce
       * střechy) prakticky neodlišila; tmavá průsvitka charakter skla
       * zachová a ikonu podloží.
       */}
      <Button
        aria-controls={mounted ? panelId : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Otevřít menu"
        className={cn(
          'flex-none [&_svg]:size-5',
          !always && 'nav:hidden',
          tone === 'glass' ? 'border-on-contrast-ghost bg-pine-deep/32' : 'bg-surface',
        )}
        onClick={() => {
          setMounted(true)
          setOpen(true)
        }}
        onFocus={() => void loadPanel()}
        onPointerEnter={() => void loadPanel()}
        ref={triggerRef}
        size="circle"
        type="button"
        variant={tone === 'glass' ? 'glass' : 'outline'}
      >
        <Menu strokeWidth={2.25} />
      </Button>

      {mounted && (
        <NavMobilePanel
          always={always}
          context={context}
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          id={panelId}
          items={items}
          onOpenChange={setOpen}
          open={open}
          triggerRef={triggerRef}
        />
      )}
    </>
  )
}
