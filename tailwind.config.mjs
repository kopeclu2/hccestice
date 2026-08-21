/**
 * JEDINÝ důvod, proč tenhle soubor existuje: theme pluginu
 * `@tailwindcss/typography` se v Tailwindu v4 nedá nastavit z CSS — pro
 * `--tw-prose-*` ani pro velikostní varianty pluginu není `@theme` namespace.
 * Načítá se přes `@config` v `src/app/globals.css`.
 *
 * Velikost `md` níž plugin sám nezná (má jen sm|base|lg|xl|2xl) — existuje
 * kvůli `md:prose-md` v `src/components/RichText/index.tsx`. Bez tohohle
 * souboru se ta třída přestane generovat, tiše.
 *
 * Barvy, tvary a velikosti patří VÝHRADNĚ do `@theme` v globals.css.
 * Sem nikdy nepřidávat barvu — jen se sem odkazovat tokenem.
 *
 * @type {import('tailwindcss').Config}
 */
const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              // Dřív `var(--text)`, což není nikde v repu definované —
              // barvy prose textu tedy byly nenastavené a dědily se.
              '--tw-prose-body': 'var(--color-dim)',
              '--tw-prose-headings': 'var(--color-ink)',
              '--tw-prose-links': 'var(--color-club)',
              '--tw-prose-bold': 'var(--color-ink)',
              h1: {
                fontWeight: 'normal',
                marginBottom: '0.25em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.5rem',
              },
              h2: {
                fontSize: '1.25rem',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
