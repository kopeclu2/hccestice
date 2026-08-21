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
 * twMerge ji zahodí při kombinaci se skutečnou barvou (`text-white` +
 * `text-meta` → jedna z nich zmizí).
 *
 * `font-size`  — velikosti z landing škály (viz globals.css `--text-*`).
 * `text-stroke` — obrysové watermarky, taky to není barva textu.
 */
const twMerge = extendTailwindMerge<'text-stroke'>({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'eyebrow',
            'caption',
            'meta',
            'body',
            'lead',
            // nadpisová škála (Heading.tsx)
            'card-title',
            'panel-title',
            'panel-title-lg',
            'section-title',
            'section-title-md',
            'section-title-lg',
            'claim',
            'claim-lg',
            // číselné displaye (Numeral.tsx)
            'numeral-xs',
            'numeral-sm',
            'numeral-md',
            'numeral-lg',
            'numeral-xl',
            'numeral-2xl',
            // obrysové watermarky (Watermark.tsx)
            'watermark-xs',
            'watermark-sm',
            'watermark-md',
            'watermark-lg',
            'watermark-xl',
            'watermark-2xl',
            'watermark-3xl',
            'watermark-4xl',
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
