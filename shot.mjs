// Screenshot harness pro vizuální / responzivní kontrolu.
//
// Použití:
//   node shot.mjs                          # všechny routy, všechny breakpointy
//   node shot.mjs /zapasy /soupiska        # jen vybrané routy
//   node shot.mjs --bp=mobile,desktop      # jen vybrané breakpointy
//   node shot.mjs --dark --out=shots-dark  # tmavý režim, vlastní adresář
//
// Dvě pasti, kvůli kterým tenhle soubor existuje:
//   1) Playwright bere `viewport`, ne `viewportSize` (to je puppeteer) — s druhým
//      názvem se nastavení tiše ignoruje a všechno se stříhá na 1280px.
//   2) `fullPage: true` sám nestačí: sekce v `Reveal` (IntersectionObserver) se
//      vyfotí s opacity 0, dokud nevstoupí do viewportu. Proto se stránka
//      nejdřív proscrolluje po polovinách viewportu.

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

const BREAKPOINTS = {
  mobile: { width: 390, height: 844, dsf: 2 }, // iPhone 14
  mobileSmall: { width: 320, height: 568, dsf: 2 }, // nejmenší reálné zařízení
  tablet: { width: 768, height: 1024, dsf: 2 }, // iPad portrait
  laptop: { width: 1024, height: 768, dsf: 1 }, // iPad landscape / malý laptop
  desktop: { width: 1440, height: 900, dsf: 1 },
}

const ROUTES = [
  '/',
  '/zapasy',
  '/soupiska',
  '/aktuality',
  '/aktuality/treninky-hc-cestice',
  '/fotogalerie',
  '/fotogalerie/hc-cestice-x-zh-pardubice---19ledna-2025',
  '/sponzori',
  '/historie-klubu',
  '/kontaky',
  '/produkty-merch',
  '/nabor',
  '/udrzba',
  '/widgety',
  '/vzory/prazdne-stavy',
  '/neexistujici-stranka-404',
]

const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const flagValue = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : null
}

const routes = args.filter((a) => !a.startsWith('--'))
const targets = routes.length ? routes : ROUTES
const outDir = path.resolve(flagValue('out') ?? 'shots')
const dark = flags.has('--dark')
const bpNames = (flagValue('bp') ?? Object.keys(BREAKPOINTS).join(',')).split(',')

const slug = (route) =>
  route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_').slice(0, 60)

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const report = []

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
    colorScheme: dark ? 'dark' : 'light',
    locale: 'cs-CZ',
  })

  for (const route of targets) {
    const page = await context.newPage()
    const consoleErrors = []
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 200)))

    try {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 120_000 })
      if (dark) {
        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
      }
      // dev-only plovoucí lišta PatternDevSwitcher kazí screenshoty
      await page.evaluate(() => {
        document
          .querySelectorAll('[data-pattern-dev-switcher], [data-nextjs-toast], nextjs-portal')
          .forEach((el) => el.remove())
      })

      // odbavit Reveal / IntersectionObserver
      const scrollHeight = await page.evaluate(async (step) => {
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 60))
        }
        window.scrollTo(0, 0)
        await new Promise((r) => setTimeout(r, 250))
        return document.body.scrollHeight
      }, Math.floor(bp.height / 2))

      // horizontální přetečení: co konkrétně vylézá z viewportu
      const overflow = await page.evaluate((vw) => {
        const docWidth = document.documentElement.scrollWidth
        const offenders = []
        if (docWidth > vw + 1) {
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect()
            if (r.width === 0 || r.height === 0) continue
            if (r.right > vw + 1 || r.left < -1) {
              const style = getComputedStyle(el)
              if (style.position === 'fixed' || style.visibility === 'hidden') continue
              // zajímá nás nejvyšší viník, ne každé jeho dítě
              if (offenders.some((o) => o.el.contains(el))) continue
              offenders.push({
                el,
                tag: el.tagName.toLowerCase(),
                cls: (el.className?.toString?.() ?? '').slice(0, 160),
                right: Math.round(r.right),
                left: Math.round(r.left),
                width: Math.round(r.width),
              })
            }
          }
        }
        return {
          docWidth,
          offenders: offenders.slice(0, 12).map(({ el, ...rest }) => rest),
        }
      }, bp.width)

      /*
       * Vodorovně seříznutý obsah. Nutné vedle kontroly přetečení výš:
       * `overflow-hidden` na kartě nebo pásu odřízne dítě, které je širší,
       * takže `document.scrollWidth` zůstane čistý a chyba se nikde nehlásí.
       * Tímhle se našel odříznutý perex v patičce, štítek „NEJBLIŽŠÍ" na
       * kartě zápasu i názvy týmů v tabulce ligy.
       */
      const clipped = await page.evaluate(() => {
        const hits = []
        for (const el of document.querySelectorAll('body *')) {
          const style = getComputedStyle(el)
          if (style.overflowX !== 'hidden' && style.overflowX !== 'clip') continue
          if (el.scrollWidth <= el.clientWidth + 1) continue

          /*
           * Watermarky, marquee a dekorace jsou **záměrně** mimo box
           * (`absolute -right-10`, `-my-5`) a hlásily by se na každé stránce
           * včetně desktopu. Za chybu se počítá jen obsah v normálním toku,
           * který se do boxu nevešel.
           */
          const box = el.getBoundingClientRect()
          const offenders = [...el.children].filter((child) => {
            const cs = getComputedStyle(child)
            if (cs.position === 'absolute' || cs.position === 'fixed') return false
            if (cs.visibility === 'hidden' || cs.display === 'none') return false
            const r = child.getBoundingClientRect()
            return r.width > 0 && r.right > box.right + 1
          })
          if (offenders.length === 0) continue

          hits.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className?.toString?.() ?? '').slice(0, 90),
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            text: (offenders[0].textContent ?? '').trim().slice(0, 60),
          })
        }
        return hits.slice(0, 12)
      })

      // Snímá se **po obrazovkách**, ne `fullPage`. Sekce v `Reveal` a karty
      // pod fold se ve fullPage capture vyfotí jako prázdná plocha, i když se
      // reálně vykreslují — ověřeno na gridu aktualit na homepage. Viewportové
      // snímky jsou věrné z definice: fotí to, co je zrovna vykreslené.
      const base = `${slug(route)}--${bpName}${dark ? '-dark' : ''}`
      const files = []
      const screens = Math.min(Math.ceil(scrollHeight / bp.height), 24)
      for (let i = 0; i < screens; i++) {
        await page.evaluate(
          ([y]) => window.scrollTo(0, y),
          [i * bp.height],
        )
        await page.waitForTimeout(450)
        const file = path.join(outDir, `${base}--${String(i + 1).padStart(2, '0')}.png`)
        await page.screenshot({ path: file })
        files.push(file)
      }

      report.push({ route, bp: bpName, scrollHeight, ...overflow, clipped, consoleErrors, files })
      const warn = overflow.docWidth > bp.width + 1 ? `  ⚠ overflow ${overflow.docWidth}px` : ''
      const clip = clipped.length ? `  ⚠ seříznuto ${clipped.length}×` : ''
      console.log(`${bpName.padEnd(12)} ${route.padEnd(48)} h=${scrollHeight}${warn}${clip}`)
      if (warn) {
        for (const o of overflow.offenders) {
          console.log(`             ↳ <${o.tag}> w=${o.width} right=${o.right} ${o.cls}`)
        }
      }
      for (const c of clipped) {
        console.log(
          `             ✂ <${c.tag}> ${c.scrollWidth}→${c.clientWidth}px „${c.text}" ${c.cls}`,
        )
      }
    } catch (err) {
      report.push({ route, bp: bpName, error: String(err).slice(0, 300) })
      console.log(`${bpName.padEnd(12)} ${route.padEnd(48)} CHYBA: ${String(err).slice(0, 120)}`)
    } finally {
      await page.close()
    }
  }

  await context.close()
}

await browser.close()
await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log(`\nhotovo → ${outDir}`)
