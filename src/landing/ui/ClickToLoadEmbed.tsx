'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { handleEmbedClick } from '@/lib/embedActivate'
import {
  EMBED_OPEN_LABEL,
  embedLoadLabel,
  embedNotice,
  embedOpenUrl,
  embedServiceOf,
  normalizeEmbedUrl,
} from '@/lib/embedHosts'
import { cn } from '@/lib/utils'

import {
  EMBED_BOX_CLASS,
  EMBED_LINK_CLASS,
  EMBED_NOTE_CLASS,
  EMBED_TITLE_CLASS,
} from './clickToLoad'

export type ClickToLoadEmbedProps = {
  allow?: string
  allowFullScreen?: boolean
  /** Rozměry a zaoblení — platí pro zástupný rámeček i pro iframe, takže se nic neposune. */
  frameClassName?: string
  frameStyle?: React.CSSProperties
  /** Ikona nad titulkem zástupného rámečku (např. špendlík u mapy); po načtení zmizí spolu s ním. */
  icon?: React.ReactNode
  referrerPolicy?: React.HTMLAttributeReferrerPolicy
  /** Bez hodnoty se iframe vloží bez `sandbox` (jako dřív mapa a YouTube blok). */
  sandbox?: string
  /** Adresa iframe; normalizuje se (`https`, `youtube-nocookie`) a musí být na seznamu hostů. */
  src: string
  /** Přístupný název iframe a nadpis zástupného rámečku. */
  title: string
}

/**
 * Cizí iframe (mapa, video, tabulka) se do dokumentu vloží až po kliknutí.
 * Do té doby je v HTML jen zástupný rámeček — prohlížeč nekontaktuje třetí
 * stranu, takže jí neodchází IP adresa ani se nenastavují její cookies.
 *
 * Volbu si komponenta pamatuje jen ve stavu stránky: bez cookies a bez
 * `localStorage`, po obnovení stránky se ptá znovu. Bez JS zůstává odkaz
 * „Otevřít v novém okně".
 */
export function ClickToLoadEmbed({
  allow,
  allowFullScreen,
  frameClassName,
  frameStyle,
  icon,
  referrerPolicy = 'strict-origin-when-cross-origin',
  sandbox,
  src,
  title,
}: ClickToLoadEmbedProps) {
  const [loaded, setLoaded] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)

  // Tlačítko po kliknutí zmizí; bez přesunu fokusu by uživatel klávesnice skončil na `<body>`.
  useEffect(() => {
    if (loaded) frameRef.current?.focus()
  }, [loaded])

  const href = normalizeEmbedUrl(src)
  if (!href) return null

  if (loaded) {
    return (
      <iframe
        allow={allow}
        allowFullScreen={allowFullScreen}
        className={cn('border-0', frameClassName)}
        ref={frameRef}
        referrerPolicy={referrerPolicy}
        sandbox={sandbox}
        src={href}
        style={frameStyle}
        title={title}
      />
    )
  }

  const service = embedServiceOf(href)

  return (
    <div
      aria-label={title}
      className={cn(EMBED_BOX_CLASS, frameClassName)}
      role="group"
      style={frameStyle}
    >
      {icon && (
        <span
          aria-hidden
          className="grid size-11 place-items-center rounded-full bg-lime text-ink [&_svg]:size-5"
        >
          {icon}
        </span>
      )}
      <span className={EMBED_TITLE_CLASS}>{title}</span>
      <span className={EMBED_NOTE_CLASS}>{embedNotice(service)}</span>
      <Button onClick={() => setLoaded(true)} size="sm" type="button" variant="dark">
        {embedLoadLabel(service)}
      </Button>
      <a
        className={EMBED_LINK_CLASS}
        href={embedOpenUrl(href) ?? href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {EMBED_OPEN_LABEL}
      </a>
    </div>
  )
}

/**
 * Obsluha tlačítek „Načíst …" v legacy HTML (`dangerouslySetInnerHTML`),
 * které React nevlastní. Nevykresluje nic — jediný posluchač na dokumentu,
 * takže nepřidá element, který by rozbil selektory `article-prose`.
 */
export function EmbedLoader() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      handleEmbedClick(event.target)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
