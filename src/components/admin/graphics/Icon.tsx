import React from 'react'

import { CLUB_NAME } from '@/lib/club'

/**
 * Nahrazuje výchozí Payload ikonu v navigaci (sbalený sidebar, mobilní
 * lišta) znakem klubu. Stejný zdroj jako `Logo` a favicon —
 * `public/icon-512.png`.
 */
export const Icon: React.FC = () => (
  // Admin grafika v Payload adminu: `next/image` tam nemá optimalizační
  // pipeline ani smysl (statický PNG z `public/`, velikost řídí admin CSS).
  // eslint-disable-next-line @next/next/no-img-element
  <img alt={CLUB_NAME} height="100%" src="/icon-512.png" width="100%" />
)
