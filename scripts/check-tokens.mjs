#!/usr/bin/env node
/**
 * Hlídač design tokenů.
 *
 * Existuje proto, že se do repa opakovaně vracely „random" barvy: 16
 * arbitrárních hex tříd, 13 `rgba()` literálů, 40 arbitrárních `rounded-[…]`
 * a 32 `text-[Xrem]` — přičemž `#17703a` (klubová zelená) byl ručně přepsaný
 * na sedmi místech, i když `--color-club` existuje.
 *
 * Proč ne ESLint: `eslint-plugin-tailwindcss` neumí přečíst CSS-first
 * `@theme` z Tailwindu v4, takže by tokeny nevidělo. Tenhle skript navíc
 * kontroluje i `.css`, kam ESLint nedohlédne. (Dřív byl důvodem i rozbitý
 * lint kvůli `FlatCompat` + `eslint-config-next@16`; ten je už opravený.)
 *
 * Výjimka: `// token-check-ignore: <důvod>` na stejném nebo předchozím
 * řádku. Důvod je POVINNÝ — prázdný je pořád chyba.
 *
 * Všechna pravidla jsou `error` (exit 1). Přepínač `--strict` zůstal jako
 * no-op, aby fungovala stará volání (šablonové pozůstatky, kvůli kterým
 * existovala upozornění, jsou pryč).
 *
 * Pravidla `no-arbitrary-*` si seznam tokenů čtou z `@theme` v globals.css,
 * takže nový token se začne hlídat sám.
 *
 * Použití:  node scripts/check-tokens.mjs [--quiet] [--strict]
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const THEME_FILE = 'src/app/globals.css'
const TOKENS_FILE = 'src/landing/tokens.ts'

/** Soubory mimo dosah: generované Payloadem. */
const SKIP = ['src/payload-types.ts', 'src/payload-generated-schema.ts']

const LANDING = ['src/landing/', 'src/app/(landing)/']

/** Barvy shadcn vrstvy — v landingu nemají co dělat (viz dvě vrstvy v globals.css). */
const SHADCN_COLORS =
  'background|foreground|card|popover|primary|secondary|muted|accent|destructive|input|ring'

/** Default paleta Tailwindu. `lime`/`red` jsou i naše tokeny — rozliší číselný sufix. */
const TW_PALETTE =
  'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone'

/* ── tokeny z @theme pro pravidla `no-arbitrary-*` ─────────────────────────── */

const theme = readFileSync(join(ROOT, THEME_FILE), 'utf8')

/** `--<ns>-<jméno>: <hodnota>;` → Map(hodnota bez mezer → jméno). */
function readTokens(ns) {
  const map = new Map()
  for (const m of theme.matchAll(new RegExp(`^\\s*--${ns}-([\\w-]+):\\s*([^;]+);`, 'gm'))) {
    map.set(m[2].replace(/\s+/g, ''), m[1])
  }
  return map
}

const escapeRe = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Pravidlo pro arbitrární třídu `<prefix>-[<hodnota>]`, jejíž hodnotu už
 * pokrývá token (nebo výchozí třída Tailwindu). `values` = Map(hodnota → třída
 * bez prefixu); hint se skládá z nalezené hodnoty.
 */
function arbitraryRule({ name, prefix, values, hint, onlyIn }) {
  const alt = [...values.keys()].map(escapeRe).join('|')
  return {
    name,
    onlyIn,
    re: new RegExp(`(?<![\\w-])-?(?:${prefix})-\\[(${alt})\\](?![\\w-])`, 'g'),
    hintFor: (m) => {
      const prefixName = m[0].replace(/^-/, '').replace(/-\[.*$/, '')
      return hint(prefixName, values.get(m[1]), m[1])
    },
  }
}

const SPACING_PREFIX =
  'p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y|inset|inset-x|inset-y|top|right|bottom|left|space-x|space-y|size|w|h|min-w|min-h|max-w|max-h|basis'

const spacingValues = new Map([
  ...[...readTokens('spacing')].filter(([v]) => v.startsWith('clamp(')),
  ...readTokens('container'),
])
// výchozí `--container-*` Tailwindu, které se v repu psaly jako arbitrární
spacingValues.set('48rem', '3xl')
spacingValues.set('80rem', '7xl')

const trackingValues = new Map([
  ...readTokens('tracking'),
  ['-0.05em', 'tighter'],
  ['-0.025em', 'tight'],
  ['0.025em', 'wide'],
  ['0.05em', 'wider'],
  ['0.1em', 'widest'],
])

const leadingValues = new Map([
  ...readTokens('leading'),
  ['1', 'none'],
  ['1.25', 'tight'],
  ['1.375', 'snug'],
  ['1.5', 'normal'],
  ['1.625', 'relaxed'],
  ['2', 'loose'],
])

const fontClampValues = new Map([...readTokens('text')].filter(([v]) => v.startsWith('clamp(')))

const breakpointValues = new Map(readTokens('breakpoint'))

/** Inline `style={{` smí zůstat jen tam, kde to jinak nejde (dynamická hodnota, SVG, admin). */
const STYLE_ALLOWLIST = [
  /src\/landing\/blocks\/Form\/Width\//,
  /src\/landing\/blocks\/ExternalEmbed\//,
  /PhotoMasonry/,
  /LightboxImage/,
  /HeaderSplit/,
  /PatternBackground/,
  /Decorations/,
  /src\/components\/RichText\/index/,
  /src\/components\/AdminBar\//,
  /src\/app\/global-error/,
  /src\/components\/admin\//,
]

const RULES = [
  {
    name: 'no-raw-hex',
    // Achromatické `#000`/`#fff` se nehlásí: v maskách a gradientech to není
    // barva, ale alfa kanál. Plochu hlídá `no-white-black`.
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
    re: new RegExp(
      String.raw`\b(?:bg|text|border|ring|fill|stroke|from|via|to)-(?:${TW_PALETTE})-(?:50|\d00|950)\b`,
      'g',
    ),
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
    name: 'no-legacy-font-token',
    // Web jede od 15. 10. 2026 na standardní škále písma Tailwindu
    // (`text-xs/sm/base/lg/xl/2xl…`, rozhodnutí uživatele). Výjimky jsou
    // `text-eyebrow` (11px mikro-label, Tailwind ho nemá), `text-watermark-*`
    // a fluidní display škála (`text-title-*`, `text-score-*`…). Staré tokeny
    // z `@theme` zmizely, takže třída by se tiše nevygenerovala.
    re: /(?<![\w-])text-(?:caption|meta|body|lead|card-title|panel-title(?:-lg)?|section-title(?:-md|-lg)?|claim(?:-lg)?|numeral-(?:xs|sm|md|lg|xl|2xl))(?![\w-])/g,
    hint: 'použij standardní velikost Tailwindu (text-xs/sm/base/lg/xl/2xl…), viz AGENTS.md → Typografie',
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
    // Rich-text blok Lexicalu: patří do shadcn vrstvy (`RichText`), ne do
    // klubového landingu. Do `src/landing/blocks` se přesunul jen kvůli
    // jednomu stromu bloků.
    exceptIn: ['src/landing/blocks/Banner/Component.tsx'],
  },
  {
    name: 'no-dark-variant-in-landing',
    // Tailwind varianta `dark:bg-x`, ne klíč v cva objektu (`dark: 'bg-x'`) —
    // rozlišuje je znak hned za dvojtečkou.
    re: /\bdark:[a-z[(-]/g,
    hint: 'landing je light-only (data-theme="light" v layoutu)',
    onlyIn: LANDING,
  },

  {
    name: 'no-pill-import',
    // `pill.ts`, `PillButton` a `PillLink` splynuly do `components/ui/button`
    // (`<Button>`, `<Button asChild><Link/></Button>`, `buttonVariants`).
    re: /from\s+['"][^'"]*\/(?:pill|PillButton|PillLink)['"]|\b(?:PillButton|PillLink|pillVariants)\b/g,
    hint: 'použij <Button>, <Button asChild><Link …/></Button> nebo buttonVariants z @/components/ui/button',
  },

  /* ── bílá/černá, výchozí radiusy, arbitrární rozměry s tokenem, inline `style` ── */
  {
    name: 'no-white-black',
    re: /(?<![\w-])(?:text|bg|border|ring|fill|stroke|from|via|to|shadow|outline|divide|placeholder)-(?:white|black)(?:\/\d+)?(?![\w-])/g,
    hintFor: (m) => {
      const [, prop, color, alpha] = m[0].match(/^(\w+)-(white|black)(?:\/(\d+))?$/) ?? []
      if (color === 'black')
        return `${prop}-scrim${alpha ? `/${alpha}` : ''} (viz @theme --color-scrim)`
      return alpha
        ? `${prop}-on-contrast-<stupeň> (žebřík strong/soft/muted/subtle/faint/ghost/line/glass/wash)`
        : `${prop}-on-contrast`
    },
  },
  {
    name: 'no-default-radius',
    // Holé `rounded` a výchozí stupně sm–3xl; `full`, `none` a `[50%]` jsou v pořádku.
    re: /(?<![\w-])rounded(?:-(?:t|b|l|r|tl|tr|bl|br|s|e|ss|se|es|ee))?(?:-(?:sm|md|lg|xl|2xl|3xl))?(?![\w\[-])(?!\s*:)/g,
    hint: 'použij --radius-* token (icon 16, item 12, chip 8, tag 4, field 14…)',
    onlyIn: LANDING,
  },
  arbitraryRule({
    name: 'no-arbitrary-spacing',
    prefix: SPACING_PREFIX,
    values: spacingValues,
    hint: (prefix, token) => `${prefix}-${token}`,
  }),
  arbitraryRule({
    name: 'no-arbitrary-tracking',
    prefix: 'tracking',
    values: trackingValues,
    hint: (_p, token) => `tracking-${token}`,
  }),
  arbitraryRule({
    name: 'no-arbitrary-leading',
    prefix: 'leading',
    values: leadingValues,
    hint: (_p, token) => `leading-${token}`,
  }),
  arbitraryRule({
    name: 'no-arbitrary-font-clamp',
    prefix: 'text',
    values: fontClampValues,
    hint: (_p, token) => `text-${token}`,
  }),
  {
    name: 'no-arbitrary-breakpoint',
    re: new RegExp(
      `(?<![\\w-])(min|max)-\\[(${[...breakpointValues.keys()].map(escapeRe).join('|')})\\]:`,
      'g',
    ),
    hintFor: (m) => {
      const token = breakpointValues.get(m[2])
      return m[1] === 'max' ? `max-${token}:` : `${token}:`
    },
  },
  {
    name: 'no-arbitrary-aspect',
    re: /(?<![\w-])aspect-\[(\d+)\/(\d+)\](?![\w-])/g,
    hintFor: (m) => `aspect-${m[1]}/${m[2]}`,
  },
  {
    name: 'style-allowlist',
    re: /\bstyle=\{\{/g,
    hint: 'inline style jen v souborech z allowlistu (dynamická hodnota); jinak utility třída',
    exceptPathRe: STYLE_ALLOWLIST,
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
    const ignored = [line, lines[i - 1] ?? ''].some((l) => /token-check-ignore:\s*\S+/.test(l))
    if (ignored || isComment(line)) return

    for (const rule of RULES) {
      if (rule.onlyIn && !rule.onlyIn.some((p) => rel.startsWith(p))) continue
      if (rule.exceptIn?.some((p) => rel.startsWith(p))) continue
      if (rule.exceptPathRe?.some((re) => re.test(rel))) continue
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
          hint: rule.hintFor ? rule.hintFor(match) : rule.hint,
          severity: 'error',
        })
      }
    }
  })
}

/* ── theme-hex-parity: tokens.ts se nesmí rozejít s @theme ─────────────── */

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
      severity: 'error',
    })
  } else if (expected !== value.toLowerCase()) {
    findings.push({
      file: TOKENS_FILE,
      line: tokens.slice(0, m.index).split('\n').length,
      col: 1,
      rule: 'theme-hex-parity',
      text: `${name}: ${value}`,
      hint: `@theme má ${expected} — hodnoty se rozešly`,
      severity: 'error',
    })
  }
}

/* ── twmerge-font-size-parity ──────────────────────────────────────────────
 * Každý `--text-*` token musí být v `lib/utils.ts` zaregistrovaný do
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
const UI_FILE = 'src/lib/utils.ts'
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
      severity: 'error',
    })
  }
}

/* ── twmerge-theme-parity ──────────────────────────────────────────────────
 * Totéž pro rozměrové tokeny: `--spacing-*`, `--container-*`, `--tracking-*`
 * a `--leading-*` musí být ve `theme` větvi `extendTailwindMerge`. Neznámou
 * třídu twMerge nesloučí (`cn('px-gutter', 'px-4')` nechá obě), takže o
 * výsledku rozhodne pořadí v CSS a ne pořadí argumentů.
 */
for (const group of ['spacing', 'container', 'tracking', 'leading']) {
  const block = ui.match(new RegExp(`\\b${group}:\\s*\\[([\\s\\S]*?)\\]`))?.[1] ?? ''
  const names = new Set([...block.matchAll(/'([\w-]+)'/g)].map((m) => m[1]))
  for (const m of theme.matchAll(new RegExp(`^\\s*--${group}-([\\w-]+):`, 'gm'))) {
    if (!names.has(m[1])) {
      findings.push({
        file: UI_FILE,
        line: 1,
        col: 1,
        rule: 'twmerge-theme-parity',
        text: `--${group}-${m[1]}`,
        hint: `chybí '${m[1]}' v theme.${group} — twMerge nesloučí třídu s tímhle tokenem`,
        severity: 'error',
      })
    }
  }
}

/* ── výstup ────────────────────────────────────────────────────────────── */

const quiet = process.argv.includes('--quiet')

const errors = findings

function countByRule(list) {
  const byRule = new Map()
  for (const f of list) byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1)
  return [...byRule].sort((a, b) => b[1] - a[1])
}

function printFindings(list, mark) {
  for (const f of list.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
    console.log(`${mark} ${f.file}:${f.line}:${f.col}  ${f.rule}\n    ${f.text}\n    → ${f.hint}`)
  }
}

if (!findings.length) {
  if (!quiet) {
    console.log(`✓ check-tokens: ${files.length} souborů, žádný únik z design systému`)
  }
  process.exit(0)
}

printFindings(errors, '✗')

if (errors.length) {
  console.log(`\n✗ ${errors.length} nálezů:`)
  for (const [rule, count] of countByRule(errors)) {
    console.log(`   ${String(count).padStart(4)}  ${rule}`)
  }
  console.log('\nVýjimku lze povolit komentářem `token-check-ignore: <důvod>` (důvod povinný).')
  process.exit(1)
}
