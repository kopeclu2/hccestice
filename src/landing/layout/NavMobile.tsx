'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { isNavItemActive, navHref } from '@/landing/features/navigation/navHref'
import type { NavItem } from '@/landing/features/navigation/types'
import { cn } from '@/lib/utils'

/**
 * Mobilní navigace — burger tlačítko a přes celou obrazovku rozbalený
 * seznam odkazů. Do `nav` (1440px) je jediná navigace, kterou uživatel má
 * (desktopové pilulky jsou `hidden nav:flex` — deset položek se vejde vedle
 * loga a CTA až od 1440px, viz `NavPills`).
 *
 * Overlay je shadcn `Sheet` (Radix Dialog) a Radix ho vykresluje portálem do
 * `document.body`. Portál je nutnost, ne volba: navigace na homepage sedí
 * uvnitř `<main class="overflow-x-clip">` (`(landing)/page.tsx`), který by
 * `position: fixed` overlay ostříhal. Stejný Radix řeší i fokus (uvěznění
 * v panelu a návrat na burger), Esc, `aria-modal` a zámek scrollu — dřív to
 * bylo ručně a Tab z panelu unikal na stránku pod ním.
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
  const pathname = usePathname()
  const triggerRef = React.useRef<HTMLButtonElement>(null)

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
    <Sheet onOpenChange={setOpen} open={open}>
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
      <SheetTrigger asChild>
        <Button
          aria-label="Otevřít menu"
          className={cn(
            'flex-none [&_svg]:size-5',
            !always && 'nav:hidden',
            tone === 'glass' ? 'border-on-contrast-ghost bg-pine-deep/32' : 'bg-surface',
          )}
          ref={triggerRef}
          size="circle"
          variant={tone === 'glass' ? 'glass' : 'outline'}
        >
          <Menu strokeWidth={2.25} />
        </Button>
      </SheetTrigger>

      <SheetContent
        aria-describedby={undefined}
        className={cn(
          'gap-0 overflow-y-auto border-0 bg-pine-deep/97 p-5 shadow-none backdrop-blur-lg data-[state=open]:duration-300 motion-reduce:animate-none',
          !always && 'nav:hidden',
        )}
        showCloseButton={false}
        overlayClassName="bg-transparent"
        side="full"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Navigace webu</SheetDescription>

        {/* Menu drží šířku i na 1024px, kde je od změny hranice pilulek
            na `nav` pořád jedinou navigací — odkazy přes celou šířku
            obrazovky by měly zbytečně dlouhou aktivní plochu. */}
        <div className="mx-auto flex w-full max-w-160 items-center justify-end">
          <SheetClose asChild>
            <Button
              aria-label="Zavřít menu"
              className="[&_svg]:size-5"
              size="circle"
              variant="glass"
            >
              <X strokeWidth={2.25} />
            </Button>
          </SheetClose>
        </div>

        {/* Aktivní odkaz se značí lime barvou a `aria-current` — stejným
            predikátem jako pilulky (`isNavItemActive`). Bez toho nebylo
            do 1280px v navigaci vůbec vidět, na které stránce uživatel
            stojí: pilulky, které aktivní stav řeší, jsou `hidden nav:flex`. */}
        <nav className="mx-auto mt-6 flex w-full max-w-160 flex-col gap-1">
          {items.map((item) => {
            const active = isNavItemActive(item, pathname)
            return (
              <Link
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'border-b border-on-contrast-wash py-3.5 text-2xl font-extrabold tracking-subheading transition-colors hover:text-lime',
                  active ? 'text-lime' : 'text-on-contrast',
                )}
                href={navHref(item, context)}
                key={item.label}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {ctaHref && ctaLabel && (
          <div className="mx-auto mt-7 w-full max-w-160">
            <Button asChild size="lg" variant="lime" withArrow>
              <Link href={ctaHref} onClick={() => setOpen(false)}>
                {ctaLabel}
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
