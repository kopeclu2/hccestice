'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import { useSelectedLayoutSegments } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { getClientSideURL } from '@/lib/getURL'
import { collectionBySegment } from '@/lib/routes'
import { cn } from '@/lib/utils'

import './index.scss'

const baseClass = 'admin-bar'

/**
 * Popisky kolekcí, které lišta nabízí k úpravě.
 *
 * Dřív tu byla i kolekce `projects`, která v tomhle projektu neexistuje,
 * a labely byly anglické — lišta byla vidět jen na CMS stránkách ve
 * `(frontend)`, takže si toho nikdo nevšiml. Od zrušení té route group
 * je na celém webu.
 */
const collectionLabels = {
  pages: { plural: 'Stránky', singular: 'Stránka' },
  posts: { plural: 'Články', singular: 'Článek' },
} as const

type CollectionKey = keyof typeof collectionLabels

/**
 * Kolekce z první části URL (`/aktuality/{slug}` je `posts`). Cesty se jmenují
 * česky, kolekce anglicky, takže je mapuje `collectionBySegment`. Kolekce bez
 * popisku lišta nenabízí a spadne se na `pages`.
 */
const collectionFromSegment = (segment: string): CollectionKey => {
  const collection = collectionBySegment[segment]
  return collection && collection in collectionLabels ? (collection as CollectionKey) : 'pages'
}

const Title: React.FC = () => <span>Administrace</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  // segments[0] je route group („(landing)"), vlastní cesta začíná na [1]
  const collection = collectionFromSegment(segments?.[1] ?? '')
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  return (
    <div
      className={cn(baseClass, 'bg-scrim py-2 text-on-contrast', {
        block: show,
        hidden: !show,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-on-contrast"
          classNames={{
            controls: 'font-medium text-on-contrast',
            logo: 'text-on-contrast',
            user: 'text-on-contrast',
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={{
            plural: collectionLabels[collection].plural,
            singular: collectionLabels[collection].singular,
          }}
          logo={<Title />}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
