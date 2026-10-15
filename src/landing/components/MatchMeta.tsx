import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Ztišený řádek údajů pod názvem zápasu — „Základní část · Rychnov nad
 * Kněžnou". Sdílí ho rozlosování i odehrané zápasy, aby oba výpisy měly
 * stejnou typografii.
 *
 * Údaje jsou samostatné položky flexu, takže se řádek zlomí **mezi** nimi,
 * ne uprostřed „Rychnov nad | Kněžnou". Oddělovač „·" visí v levém odsazení
 * každé položky a obal ho u první položky na řádku ořízne (`-ml-3` +
 * `overflow-hidden`) — po zalomení tak řádek nezačíná ani nekončí tečkou.
 * Položka delší než celý řádek se zalomí uvnitř sebe.
 *
 * Barvu a velikost lze přepsat `className` (tmavý panel: `text-white/65`).
 */
export function MatchMeta({
  items,
  className,
}: {
  items: Array<string | null | undefined>
  className?: string
}) {
  const list = items.filter((item): item is string => Boolean(item))
  if (list.length === 0) return null

  return (
    <div className={cn('text-faint overflow-hidden text-caption font-semibold', className)}>
      <div className="-ml-3 flex flex-wrap">
        {list.map((item, index) => (
          <span
            className="relative min-w-0 pl-3 before:absolute before:left-1 before:content-['·']"
            key={`${index}-${item}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
