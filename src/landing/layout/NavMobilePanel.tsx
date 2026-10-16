'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { RefObject } from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { isNavItemActive, navHref } from '@/landing/features/navigation/navHref'
import type { NavItem } from '@/landing/features/navigation/types'
import { cn } from '@/lib/utils'

/**
 * Rozbalený panel mobilního menu — shadcn `Sheet` (Radix Dialog) a obsah.
 * Načítá ho líně `NavMobile` (viz tam), proto je v samostatném modulu:
 * Radix Dialog s focus trapem, `react-remove-scroll` a `aria-hidden`
 * knihovnou je kus JS, který většina návštěvníků nikdy nepoužije.
 *
 * Overlay je portál do `document.body`. Portál je nutnost, ne volba:
 * navigace na homepage sedí uvnitř `<main class="overflow-x-clip">`
 * (`(landing)/page.tsx`), který by `position: fixed` overlay ostříhal.
 *
 * Aktivní odkaz se značí lime barvou a `aria-current` — stejným predikátem
 * jako pilulky (`isNavItemActive`). Bez toho nebylo do 1440px v navigaci
 * vůbec vidět, na které stránce uživatel stojí: pilulky jsou `hidden nav:flex`.
 */
export function NavMobilePanel({
  id,
  open,
  onOpenChange,
  items,
  ctaHref,
  ctaLabel,
  context,
  always,
  triggerRef,
}: {
  /** Shoduje se s `aria-controls` na burgeru. */
  id: string
  open: boolean
  onOpenChange: (open: boolean) => void
  items: NavItem[]
  ctaHref?: string
  ctaLabel?: string
  context: 'home' | 'subpage'
  always: boolean
  /** Burger, kam se po zavření vrací fokus. */
  triggerRef: RefObject<HTMLButtonElement | null>
}) {
  const pathname = usePathname()

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        aria-describedby={undefined}
        className={cn(
          'gap-0 overflow-y-auto border-0 bg-pine-deep/97 p-5 shadow-none backdrop-blur-lg data-[state=open]:duration-300 motion-reduce:animate-none',
          !always && 'nav:hidden',
        )}
        id={id}
        // Radix by fokus vrátil na prvek, který ho měl při montáži panelu.
        // Ten se kvůli línému chunku může od kliknutí na burger lišit, a
        // burger je jediný vlastník otevření, proto se vrací výslovně na něj.
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          triggerRef.current?.focus()
        }}
        overlayClassName="bg-transparent"
        showCloseButton={false}
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
                onClick={() => onOpenChange(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {ctaHref && ctaLabel && (
          <div className="mx-auto mt-7 w-full max-w-160">
            <Button asChild size="lg" variant="lime" withArrow>
              <Link href={ctaHref} onClick={() => onOpenChange(false)}>
                {ctaLabel}
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
