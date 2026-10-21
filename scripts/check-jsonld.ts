/**
 * Kontrola strukturovaných dat (JSON-LD) bez Rich Results Testu.
 *
 *   bun scripts/check-jsonld.ts
 *       builderů stránek nad ukázkovými daty (`jsonld-samples.ts`)
 *   bun scripts/check-jsonld.ts --url=https://…/zapasy/<slug> --url=https://…/aktuality/<slug>
 *       vyrenderované stránky (stáhne HTML, vytáhne `application/ld+json`)
 *
 * Kontroluje povinná pole Google Event (name, startDate, location.name +
 * address), Article (headline, image, datePublished), BreadcrumbList a
 * konzistenci `@id` (`src/lib/jsonLdCheck.ts`). Exit 1 při chybě; varování
 * jen vypíše. Není to náhrada Rich Results Testu — je to síť pro regrese.
 *
 * `--url` posílá požadavky **po jednom s prodlevou ≥ 1 s** (sdílený server).
 */
import { checkJsonLd, extractJsonLd, type JsonLdReport } from '@/lib/jsonLdCheck'

import { sampleDocuments } from './jsonld-samples'

const urls = process.argv
  .slice(2)
  .filter((arg) => arg.startsWith('--url='))
  .map((arg) => arg.slice('--url='.length))

const results: Array<[string, JsonLdReport]> = []

if (urls.length === 0) {
  for (const [name, doc] of Object.entries(sampleDocuments))
    results.push([name, checkJsonLd(doc, name)])
} else {
  for (const url of urls) {
    const response = await fetch(url, { headers: { 'user-agent': 'hccestice-jsonld-check/1.0' } })
    if (!response.ok) {
      results.push([url, { errors: [`HTTP ${response.status}`], warnings: [] }])
    } else {
      const docs = extractJsonLd(await response.text())
      const merged: JsonLdReport = { errors: [], warnings: [] }
      if (docs.length === 0) merged.errors.push('stránka nemá žádný JSON-LD')
      docs.forEach((doc, index) => {
        const report = checkJsonLd(doc, `${url} #${index + 1}`)
        merged.errors.push(...report.errors)
        merged.warnings.push(...report.warnings)
      })
      results.push([url, merged])
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

let failed = 0
for (const [name, { errors, warnings }] of results) {
  const status = errors.length ? 'CHYBA' : warnings.length ? 'varování' : 'ok'
  console.log(`${status.padEnd(9)} ${name}`)
  for (const message of errors) console.log(`    chyba: ${message}`)
  for (const message of warnings) console.log(`    varování: ${message}`)
  failed += errors.length
}
console.log(`\n${results.length} dokumentů, ${failed} chyb`)
process.exit(failed ? 1 : 0)
