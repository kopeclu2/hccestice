'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/utilities/ui'

import { navHref } from '../data/navHref'
import type { NavItem } from '../types'

import { PillLink } from './PillLink'

/**
 * Mobilní navigace — burger tlačítko a přes celou obrazovku rozbalený
 * seznam odkazů. Do `xl` je jediná navigace, kterou uživatel má
 * (desktopové pilulky jsou `hidden xl:flex` — devět položek se vedle loga
 * a CTA vejde až od 1280px, viz `NavPills`).
 *
 * Overlay se renderuje portálem do `document.body`. Nutnost, ne volba:
 * navigace na homepage sedí uvnitř `<main class="overflow-x-clip">`
 * (`(landing)/page.tsx`), který by `position: fixed` overlay ostříhal.
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
  const [mounted, setMounted] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => setMounted(true), [])

  // Zavřít při přechodu na jinou stránku. U kotev na téže stránce se
  // pathname nemění, proto navíc onClick na položkách.
  React.useEffect(() => setOpen(false), [pathname])

  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <button
        aria-controls="nav-mobile"
        aria-expanded={open}
        aria-label="Otevřít menu"
        className={cn(
          'grid size-10 flex-none place-items-center rounded-full transition-colors [&_svg]:size-5',
          !always && 'xl:hidden',
          tone === 'glass'
            ? 'border border-white/28 bg-white/16 text-white backdrop-blur-lg hover:bg-white/30'
            : 'border-line text-ink hover:bg-contrast border bg-surface hover:text-on-contrast',
        )}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu strokeWidth={2.25} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className={cn(
              'bg-pine-deep/97 fixed inset-0 z-50 flex flex-col overflow-y-auto p-5 backdrop-blur-lg',
              !always && 'xl:hidden',
            )}
            id="nav-mobile"
          >
            {/* Menu drží šířku i na 1024px, kde je od změny hranice pilulek
                na `xl` pořád jedinou navigací — odkazy přes celou šířku
                obrazovky by měly zbytečně dlouhou aktivní plochu. */}
            <div className="mx-auto flex w-full max-w-160 items-center justify-end">
              <button
                aria-label="Zavřít menu"
                className="grid size-10 place-items-center rounded-full border border-white/28 bg-white/16 text-white transition-colors hover:bg-white/30 [&_svg]:size-5"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X strokeWidth={2.25} />
              </button>
            </div>

            <nav className="mx-auto mt-6 flex w-full max-w-160 flex-col gap-1">
              {items.map((item) => (
                <Link
                  className="hover:text-lime border-b border-white/10 py-3.5 text-2xl font-extrabold tracking-[-0.02em] text-white transition-colors"
                  href={navHref(item, context)}
                  key={item.label}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {ctaHref && ctaLabel && (
              <div className="mx-auto mt-7 w-full max-w-160">
                <PillLink
                  href={ctaHref}
                  onClick={() => setOpen(false)}
                  size="lg"
                  variant="lime"
                  withArrow
                >
                  {ctaLabel}
                </PillLink>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}
