'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'

import { cn } from '@/utilities/ui'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.scss'

import { getClientSideURL } from '@/utilities/getURL'

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
 * Mapa první URL části → slug kolekce v Payloadu. Cesty se jmenují česky,
 * kolekce anglicky, takže se nedají odvodit jedna z druhé: `/aktuality/{slug}`
 * je kolekce `posts`. Dřív se segment bral jako slug kolekce přímo, takže se
 * po přejmenování `/posts` na `/aktuality` u článků nabízela `pages`.
 */
const ROUTE_TO_COLLECTION: Record<string, CollectionKey> = {
  aktuality: 'posts',
}

const Title: React.FC = () => <span>Administrace</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  // segments[0] je route group („(landing)"), vlastní cesta začíná na [1]
  const collection: CollectionKey = ROUTE_TO_COLLECTION[segments?.[1] ?? ''] ?? 'pages'
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  return (
    <div
      className={cn(baseClass, 'py-2 bg-black text-white', {
        block: show,
        hidden: !show,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
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
