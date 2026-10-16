/**
 * Utility functions for UI components automatically added by ShadCN and used in a few of our frontend components and blocks.
 *
 * Other functions may be exported from here in the future or by installing other shadcn components.
 */

import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * twMerge zná jen výchozí Tailwind názvy. Vlastní tokeny z `@theme` mu musíme
 * zařadit ručně, jinak `text-*` utility spadne do skupiny „barva textu" a
 * twMerge ji zahodí při kombinaci se skutečnou barvou (`text-on-contrast` +
 * `text-title-md` → jedna z nich zmizí).
 *
 * `font-size`  — velikosti z landing škály (viz globals.css `--text-*`).
 * `theme`      — rozměrové tokeny (`--spacing-*`, `--container-*`, `--tracking-*`,
 *                `--leading-*`); radiusy zatím nejsou (registrace by změnila,
 *                která z dvojice `rounded-*` v `cn()` vyhraje).
 * `text-stroke` — obrysové watermarky, taky to není barva textu.
 */
const twMerge = extendTailwindMerge<'text-stroke'>({
  extend: {
    /*
     * Theme klíče, ze kterých Tailwind skládá utility z `@theme`. Bez nich by
     * `cn('px-gutter', 'px-4')` nechal obě třídy a o výsledku by rozhodlo
     * pořadí v CSS, ne pořadí argumentů.
     */
    theme: {
      spacing: [
        'gutter',
        'gutter-tight',
        'gutter-nav',
        'split-gap',
        'hero-gap',
        'hero-inset',
        'panel',
        'panel-y',
      ],
      container: ['page', 'article'],
      tracking: [
        'display',
        'title-tight',
        'title',
        'heading',
        'subheading',
        'snug',
        'caps-sm',
        'caps-md',
        'caps-lg',
      ],
      leading: ['copy', 'title', 'title-tight', 'heading', 'heading-tight', 'display', 'score'],
    },
    classGroups: {
      'font-size': [
        {
          text: [
            'eyebrow',
            // obrysové watermarky (Watermark.tsx)
            'watermark-xs',
            'watermark-sm',
            'watermark-md',
            'watermark-lg',
            'watermark-xl',
            'watermark-2xl',
            'watermark-3xl',
            'watermark-4xl',
            'watermark-maintenance',
            // fluidní display škála (globals.css `--text-title-*` a spol.)
            'title-hero',
            'title-xl',
            'title-lg',
            'title-hero-sm',
            'title-md',
            'title-system',
            'title-sm',
            'score',
            'score-board',
            'score-arena',
            'score-editorial',
            'score-editorial-lg',
            'score-split',
            'score-split-lg',
            'hero-meta',
            'hero-value',
            'countdown',
            'countdown-label',
            'contact-lg',
            'contact-md',
            'year',
            'jersey',
            'jersey-md',
            'error-code',
          ],
        },
      ],
      'text-stroke': ['text-stroke'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
