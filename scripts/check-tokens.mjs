#!/usr/bin/env node
/**
 * Hlídač design tokenů.
 *
 * Existuje proto, že se do repa opakovaně vracely „random" barvy: 16
 * arbitrárních hex tříd, 13 `rgba()` literálů, 40 arbitrárních `rounded-[…]`
 * a 32 `text-[Xrem]` — přičemž `#17703a` (klubová zelená) byl ručně přepsaný
 * na sedmi místech, i když `--color-club` existuje.
 *
 * Proč ne ESLint: `bun run lint` je v tomhle repu rozbitý (`FlatCompat`
 * + `eslint-config-next@16` → „Converting circular structure to JSON"),
 * takže by pravidlo bylo mrtvé. `eslint-plugin-tailwindcss` navíc neumí
 * přečíst CSS-first `@theme` z Tailwindu v4, takže by tokeny nevidělo.
 * Tenhle skript navíc kontroluje i `.css`, kam ESLint nedohlédne.
 *
 * Výjimka: `// token-check-ignore: <důvod>` na stejném nebo předchozím
 * řádku. Důvod je POVINNÝ — prázdný je pořád chyba.
 *
 * Použití:  node scripts/check-tokens.mjs [--quiet]
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const THEME_FILE = 'src/app/globals.css'
const TOKENS_FILE = 'src/landing/tokens.ts'

/** Soubory mimo dosah: generované Payloadem a vendorované shadcn primitivy. */
const SKIP = [
  'src/payload-types.ts',
  'src/payload-generated-schema.ts',
  'src/components/ui/', // upstream shadcn, drží se vlastní oklch vrstvy
]

const LANDING = ['src/landing/', 'src/app/(landing)/']

/** Barvy shadcn vrstvy — v landingu nemají co dělat (viz dvě vrstvy v globals.css). */
const SHADCN_COLORS =
  'background|foreground|card|popover|primary|secondary|muted|accent|destructive|input|ring'

/** Default paleta Tailwindu. `lime`/`red` jsou i naše tokeny — rozliší číselný sufix. */
const TW_PALETTE =
  'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone'

const RULES = [
  {
    name: 'no-raw-hex',
    // Achromatické `#000`/`#fff` se nehlásí: v maskách a gradientech to není
    // barva, ale alfa kanál, a pro plochu existuje `bg-white` / `bg-black`.
    re: /#(?!(?:000|fff|000000|ffffff)\b)[0-9a-fA-F]{3,8}\b/gi,
    hint: 'použij utility třídu nebo var(--color-*)',
  },
  {
    name: 'no-rgb-literal',
    re: /\brgba?\(/g,
    hint: 'použij --alpha(var(--color-x) / N%) nebo color-mix()',
  },
  {
    name: 'no-arbitrary-color-class',
    re: /\b(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|shadow|caret|accent|decoration)-\[(?!clamp\(|calc\(|--alpha\(|var\(|url\(|radial-|linear-|repeating-|conic-|image:|background:|mask|[\d.])/g,
    hint: 'chybí token v @theme?',
  },
  {
    name: 'no-default-palette',
    re: new RegExp(String.raw`\b(?:bg|text|border|ring|fill|stroke|from|via|to)-(?:${TW_PALETTE})-(?:50|\d00|950)\b`, 'g'),
    hint: 'default paleta Tailwindu obchází design systém',
  },
  {
    name: 'no-arbitrary-radius',
    re: /\brounded(?:-[a-z]+)?-\[(?!50%|calc\(|var\()/g,
    hint: 'použij --radius-* token',
  },
  {
    name: 'no-arbitrary-font-size',
    // `em`/`%` se nehlásí: jsou relativní k rodiči (dvojtečka a horní index
    // ve skóre musí škálovat s ním), což rem token neumí vyjádřit.
    re: /\btext-\[(?!clamp\(|calc\(|var\(|#|rgb)(?:[^\]]*?)\]/g,
    hint: 'použij --text-* token',
    skipMatch: (m) => /[\d.](?:em|%|ch|ex)\]$/.test(m),
  },
  {
    name: 'no-shadcn-in-landing',
    // Lookahead brání záměně s vlastními tokeny, které jen začínají stejně
    // (`text-card-title` není shadcn `text-card`).
    re: new RegExp(
      String.raw`\b(?:bg|text|border|ring|divide)-(?:${SHADCN_COLORS})(?:-foreground)?(?![\w-])`,
      'g',
    ),
    hint: 'landing má vlastní paletu; shadcn tokeny patří jen do components/ui a (frontend)',
    onlyIn: LANDING,
  },
  {
    name: 'no-dark-variant-in-landing',
    // Tailwind varianta `dark:bg-x`, ne klíč v cva objektu (`dark: 'bg-x'`) —
    // rozlišuje je znak hned za dvojtečkou.
    re: /\bdark:[a-z[(-]/g,
    hint: 'landing je light-only (data-theme="light" v layoutu)',
    onlyIn: LANDING,
  },
]

/** Komentářové řádky — dokumentace o tokenech není únik tokenu. */
const isComment = (line) => /^\s*(\/\/|\/\*|\*)/.test(line)

/* ── sběr souborů ──────────────────────────────────────────────────────── */

const files = []
;(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full)
    else if (/\.(tsx?|css)$/.test(entry)) files.push(full)
  }
})(join(ROOT, 'src'))

/* ── kontrola pravidel ─────────────────────────────────────────────────── */

const findings = []

for (const file of files) {
  const rel = relative(ROOT, file)
  if (SKIP.some((s) => rel.startsWith(s))) continue

  const lines = readFileSync(file, 'utf8').split('\n')
  const isTheme = rel === THEME_FILE
  const isTokens = rel === TOKENS_FILE

  lines.forEach((line, i) => {
    // escape hatch na stejném nebo předchozím řádku, s povinným důvodem
    const ignored = [line, lines[i - 1] ?? ''].some((l) =>
      /token-check-ignore:\s*\S+/.test(l),
    )
    if (ignored || isComment(line)) return

    for (const rule of RULES) {
      if (rule.onlyIn && !rule.onlyIn.some((p) => rel.startsWith(p))) continue
      if (rule.skipLine?.(line)) continue
      // @theme a hex zrcadlo tokenů SMÍ obsahovat hex — jsou to definice
      if ((isTheme || isTokens) && rule.name === 'no-raw-hex') continue

      rule.re.lastIndex = 0
      let match
      while ((match = rule.re.exec(line))) {
        if (rule.skipMatch?.(match[0])) continue
        break
      }
      if (match) {
        findings.push({
          file: rel,
          line: i + 1,
          col: match.index + 1,
          rule: rule.name,
          text: line.trim().slice(0, 100),
          hint: rule.hint,
        })
      }
    }
  })
}

/* ── theme-hex-parity: tokens.ts se nesmí rozejít s @theme ─────────────── */

const theme = readFileSync(join(ROOT, THEME_FILE), 'utf8')
const themeColors = new Map()
// `--color-*` = téma-nezávislé (značka, výsledky, stavy);
// `--ds-*` = téma-závislé plochy a text, jejichž světlá hodnota žije v `:root`.
for (const m of theme.matchAll(/--(?:color|ds)-([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
  if (!themeColors.has(m[1])) themeColors.set(m[1], m[2].toLowerCase())
}

const tokens = readFileSync(join(ROOT, TOKENS_FILE), 'utf8')
for (const m of tokens.matchAll(/'?([\w-]+)'?:\s*'(#[0-9a-fA-F]{3,8})'/g)) {
  const [, name, value] = m
  const expected = themeColors.get(name)
  if (!expected) {
    findings.push({
      file: TOKENS_FILE,
      line: tokens.slice(0, m.index).split('\n').length,
      col: 1,
      rule: 'theme-hex-parity',
      text: `${name}: ${value}`,
      hint: `--color-${name} v ${THEME_FILE} neexistuje`,
    })
  } else if (expected !== value.toLowerCase()) {
    findings.push({
      file: TOKENS_FILE,
      line: tokens.slice(0, m.index).split('\n').length,
      col: 1,
      rule: 'theme-hex-parity',
      text: `${name}: ${value}`,
      hint: `@theme má ${expected} — hodnoty se rozešly`,
    })
  }
}

/* ── twmerge-font-size-parity ──────────────────────────────────────────────
 * Každý `--text-*` token musí být v `utilities/ui.ts` zaregistrovaný do
 * skupiny `font-size`. Jinak ho tailwind-merge považuje za BARVU textu a při
 * kombinaci se skutečnou barvou jednu z nich zahodí — `cn('text-club/10
 * text-watermark-xl')` pak vyrenderuje watermark bez barvy. Tohle už se
 * v repu stalo dvakrát, proto je to test, ne komentář.
 *
 * `--text-shadow-*` je jiný namespace (Tailwind z něj generuje
 * `text-shadow-*`, ne velikost písma) a tailwind-merge pro něj má vlastní
 * skupinu `text-shadow`, takže do font-size nepatří — ověřeno, že
 * `text-white text-shadow-photo` obě třídy udrží.
 */
const UI_FILE = 'src/utilities/ui.ts'
const ui = readFileSync(join(ROOT, UI_FILE), 'utf8')
const fontSizeBlock = ui.match(/'font-size':\s*\[[\s\S]*?\n {6}\],/)?.[0] ?? ''
const registered = new Set([...fontSizeBlock.matchAll(/'([\w-]+)'/g)].map((m) => m[1]))

for (const m of theme.matchAll(/^\s*--text-(?!shadow-)([\w-]+):/gm)) {
  const name = m[1]
  if (!registered.has(name)) {
    findings.push({
      file: UI_FILE,
      line: ui.slice(0, ui.indexOf("'font-size'")).split('\n').length,
      col: 1,
      rule: 'twmerge-font-size-parity',
      text: `--text-${name}`,
      hint: `chybí '${name}' ve skupině font-size — twMerge ho bude brát jako barvu textu`,
    })
  }
}

/* ── výstup ────────────────────────────────────────────────────────────── */

if (!findings.length) {
  if (!process.argv.includes('--quiet')) {
    console.log(`✓ check-tokens: ${files.length} souborů, žádný únik z design systému`)
  }
  process.exit(0)
}

const byRule = new Map()
for (const f of findings) byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1)

for (const f of findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
  console.log(`${f.file}:${f.line}:${f.col}  ${f.rule}\n    ${f.text}\n    → ${f.hint}`)
}

console.log(`\n✗ ${findings.length} nálezů:`)
for (const [rule, count] of [...byRule].sort((a, b) => b[1] - a[1])) {
  console.log(`   ${String(count).padStart(4)}  ${rule}`)
}
console.log('\nVýjimku lze povolit komentářem `token-check-ignore: <důvod>` (důvod povinný).')
process.exit(1)
