/**
 * Vizuální kontrola landing page — celostránkové screenshoty
 * (desktop 1440, mobil 390) + detekce horizontálního overflow.
 *
 * Spuštění: node migration/screenshot.mjs [url]
 */
import { chromium } from '@playwright/test'

const url = process.argv[2] ?? 'http://localhost:3000/'
const browser = await chromium.launch()

for (const [name, viewport] of [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({ viewport })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  // scroll až dolů, ať se spustí lazy-load obrázků a reveal animace
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(2000)

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  console.log(`${name}: overflow ${overflow}px`)

  await page.screenshot({ path: `/tmp/landing-${name}.png`, fullPage: true })
}

await browser.close()
console.log('OK: /tmp/landing-desktop.png, /tmp/landing-mobile.png')
