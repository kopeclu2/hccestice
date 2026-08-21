'use client'

import { motion, useReducedMotion } from 'motion/react'
import React from 'react'

/**
 * Jemné scroll-reveal animace (fade + posun nahoru) přes `motion`.
 *
 * Animuje se jen jednou při vstupu do viewportu; respektuje
 * `prefers-reduced-motion` (pak se obsah zobrazí bez pohybu).
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  /** Zpoždění v sekundách — pro kaskádu karet v mřížce. */
  delay?: number
}) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  )
}
