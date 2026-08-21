import { LANDING_COLORS as C } from '@/landing/tokens'

/**
 * Barvy a zvýraznění textu (TextStateFeature) — JEDINÝ zdroj pravdy.
 *
 * Používá ho editor v adminu (`defaultLexical.ts`) i frontendový
 * JSX converter (`@/components/RichText`), který stejné CSS aplikuje
 * při renderu — výchozí lexical converter stavy z `$` ignoruje.
 *
 * Hodnoty se berou z `@/landing/tokens` (hex zrcadlo `@theme`), ne ručně:
 * admin `globals.css` neloaduje, takže `var(--color-*)` by tu bylo prázdné.
 * Dřív tu bylo 10 ručně přepsaných hex hodnot, z nichž pět duplikovalo
 * existující tokeny a čtyři byly hodnoty z default palety Tailwindu.
 *
 * `light-dark()` zajistí čitelnost i v tmavém režimu administrace
 * (web je vždy světlý → použije se první hodnota).
 */
export const TEXT_STATE: Record<
  string,
  Record<string, { css: Record<string, string>; label: string }>
> = {
  // barva písma — klubová paleta
  color: {
    club: { css: { color: `light-dark(${C.club}, ${C.lime})` }, label: 'Klubová zelená' },
    red: { css: { color: `light-dark(${C.danger}, ${C['danger-soft']})` }, label: 'Červená' },
    faint: { css: { color: `light-dark(${C.faint}, ${C['faint-dark']})` }, label: 'Šedá' },
  },
  // zvýraznění pozadí — barva textu vynucená, ať je čitelné všude
  highlight: {
    lime: {
      css: { 'background-color': C.lime, color: C.ink, padding: '0 0.2em' },
      label: 'Lime zvýraznění',
    },
    green: {
      css: {
        'background-color': `light-dark(${C.tint}, color-mix(in oklab, ${C.club} 45%, transparent))`,
        color: `light-dark(${C.ink}, ${C.tint})`,
        padding: '0 0.2em',
      },
      label: 'Zelené zvýraznění',
    },
  },
}
