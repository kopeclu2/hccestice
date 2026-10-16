'use client'

import dynamic from 'next/dynamic'
import React from 'react'

import type { FormBlockType } from './Component'

/**
 * Klientská líná hranice formulářového bloku.
 *
 * `FormBlock` je `'use client'` a přes `./fields.tsx` si táhne
 * `react-hook-form`, radix primitivy a (kvůli typu pole „message")
 * i `@payloadcms/richtext-lexical/react`. Turbopack přitom slučuje celý
 * klientský graf routy do jedné dychtivě načítané skupiny, takže tenhle
 * balík platila **každá CMS stránka** — i ta, která formulář nemá.
 * Ověřeno dotazem do CMS: blok `formBlock` je v obsahu **0×**, takže
 * dneska ho nestahuje nikdo pro nic za nic jen teoreticky.
 *
 * `dynamic()` musí být volané odsud, z `'use client'` modulu — ze
 * serverového `./Server.tsx` by neudělalo nic
 * (`node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:60`).
 *
 * `ssr: false` je tu v pořádku: formulář nemá pro vyhledávače hodnotu
 * a v Server Componentě by stejně nebyl povolený. `min-h` rezervuje místo,
 * aby dosazení formuláře neposunulo obsah pod ním.
 */
const FormBlock = dynamic(() => import('./Component').then((mod) => mod.FormBlock), {
  ssr: false,
  loading: () => <div className="min-h-96" />,
})

export const FormBlockLazy: React.FC<
  {
    id?: string
    intro?: React.ReactNode
    confirmation?: React.ReactNode
  } & FormBlockType
> = (props) => <FormBlock {...props} />
