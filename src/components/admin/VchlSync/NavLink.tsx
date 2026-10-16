'use client'

import { NavGroup } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const HREF = '/admin/vchl-sync'

/** Odkaz na ovládací stránku synchronizace v levé navigaci adminu. */
export const VchlSyncNavLink: React.FC = () => {
  const pathname = usePathname()
  const active = pathname === HREF || pathname?.startsWith(`${HREF}/`)

  return (
    <NavGroup label="Synchronizace">
      <Link
        className={`nav__link${active ? 'active' : ''}`}
        href={HREF}
        id="nav-vchl-sync"
        prefetch={false}
      >
        {active && <div className="nav__link-indicator" />}
        <span className="nav__link-label">Synchronizace VČHL</span>
      </Link>
    </NavGroup>
  )
}
