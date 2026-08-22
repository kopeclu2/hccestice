// Screenshot jednoho prvku (selektor) přes všechny breakpointy.
//
//   node scripts/shot-el.mjs '#treninky' --out=shots-el [--bp=mobile,tablet]
//
// Doplněk k `shot.mjs`: ten fotí celé stránky po obrazovkách, tohle izoluje
// jednu sekci, aby se dala porovnat mezi šířkami vedle sebe.

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

const BREAKPOINTS = {
  mobileSmall: { width: 320, height: 568, dsf: 2 },
  mobile: { width: 390, height: 844, dsf: 2 },
  mobileLarge: { width: 430, height: 932, dsf: 2 },
  tabletSmall: { width: 600, height: 900, dsf: 2 },
  tablet: { width: 768, height: 1024, dsf: 2 },
  laptop: { width: 1024, height: 768, dsf: 1 },
  desktop: { width: 1440, height: 900, dsf: 1 },
}

const args = process.argv.slice(2)
const flagValue = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : null
}
const positional = args.filter((a) => !a.startsWith('--'))
const selector = positional[0]
const route = positional[1] ?? '/'
const outDir = path.resolve(flagValue('out') ?? 'shots-el')
const bpNames = (flagValue('bp') ?? Object.keys(BREAKPOINTS).join(',')).split(',')

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()

for (const bpName of bpNames) {
  const bp = BREAKPOINTS[bpName]
  if (!bp) {
    console.error(`neznámý breakpoint: ${bpName}`)
    continue
  }
  const context = await browser.newContext({
    viewport: { width: bp.width, height: bp.height },
    deviceScaleFactor: bp.dsf,
    isMobile: bp.width < 768,
    hasTouch: bp.width < 1024,
    locale: 'cs-CZ',
  })
  const page = await context.newPage()
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' })

  // Reveal běží na IntersectionObserver — bez proscrollování je sekce průhledná.
  const el = page.locator(selector).first()
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)

  const box = await el.boundingBox()
  await el.screenshot({ path: path.join(outDir, `${bpName}.png`) })
  console.log(`${bpName.padEnd(12)} ${Math.round(box.width)}×${Math.round(box.height)}`)
  await context.close()
}

await browser.close()
console.log(`\nhotovo → ${outDir}`)
