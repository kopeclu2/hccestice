/**
 * Hex zrcadlo barevné palety z `@theme` v `src/app/globals.css`.
 *
 * Existuje JEN pro kontexty, které nevidí CSS custom properties, a proto se
 * v nich `var(--color-*)` neresolvuje:
 *
 * - **Payload admin** (`src/fields/textStateColors.ts` → `defaultLexical.ts`).
 *   Editor běží v adminu, který `globals.css` vůbec neloaduje.
 * - **`data:image/svg+xml`** dlaždice (viz `TONE_RGB` v `PatternBackground.tsx`).
 * - **`app/global-error.tsx`**. Ta stránka nahrazuje root layout, takže se
 *   k ní `globals.css` (a tím ani `@theme`) nedostane — barvy musí být inline.
 * - **Transakční e-maily** (`src/email/render.ts`). E-mailoví klienti neznají
 *   CSS custom properties ani `<style>` — barvy musí být inline v atributu
 *   `style`. Nový hex mirror pro ně záměrně nevznikl: `theme-hex-parity`
 *   v `scripts/check-tokens.mjs` hlídá jedinou cestu (`TOKENS_FILE`), takže
 *   druhý soubor by z dohledu vypadl.
 * - **`theme-color` meta a `manifest.webmanifest`** (`(landing)/layout.tsx`).
 *   Browser i OS čtou tyhle hodnoty přímo z atributu/JSON souboru, ne z
 *   vyrenderovaného CSS — `var(--color-*)` by tu byl doslovný string.
 *
 * Nikde jinde tenhle soubor nepoužívej — v komponentách vždy utility třída
 * nebo `var(--color-*)`. Hodnoty hlídá pravidlo `theme-hex-parity`
 * v `scripts/check-tokens.mjs`: když se rozejdou s `globals.css`, check spadne.
 */
export const LANDING_COLORS = {
  ink: '#0f1512',
  club: '#5e9e46',
  'club-dark': '#497d36',
  lime: '#7bcc5d',
  dim: '#535f58',
  faint: '#6b736e',
  'faint-dark': '#a9b4ad',
  tint: '#e8f2ec',
  paper: '#f4f6f4',
  'line-mid': '#e2e9e4',
  danger: '#b91c1c',
  'danger-soft': '#f87171',
} as const satisfies Record<string, `#${string}`>
