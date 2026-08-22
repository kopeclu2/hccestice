'use client'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { useState } from 'react'

/**
 * Ikona jde z `lucide-react`, ne z `@payloadcms/ui/icons/Copy`.
 *
 * Ten import tahal do bundlu veřejného webu i stylopis administrace
 * (`@layer payload-default { .icon--copy … }`) jako **samostatný
 * render-blocking CSS chunk na každé stránce** — Lighthouse ho na
 * homepage vidí vedle Tailwindu a fontů, přitom `.icon--copy` je jediné
 * pravidlo, které v něm je. `lucide-react` už projekt používá jinde
 * (`PhotoTile`, `TileArrow`) a vkládá SVG inline, bez CSS.
 */

export function CopyButton({ code }: { code: string }) {
  const [text, setText] = useState('Copy')

  function updateCopyStatus() {
    if (text === 'Copy') {
      setText(() => 'Copied!')
      setTimeout(() => {
        setText(() => 'Copy')
      }, 1000)
    }
  }

  return (
    <div className="flex justify-end align-middle">
      <Button
        className="flex gap-1"
        variant={'secondary'}
        onClick={async () => {
          await navigator.clipboard.writeText(code)
          updateCopyStatus()
        }}
      >
        <p>{text}</p>
        <Copy aria-hidden className="size-4" />
      </Button>
    </div>
  )
}
