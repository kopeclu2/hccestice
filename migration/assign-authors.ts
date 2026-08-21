import { writeFileSync } from 'fs'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const AUTHOR_ID = 8 // Vladimír Javůrek

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'posts',
  limit: 0,
  depth: 0,
  draft: true,
  pagination: false,
  overrideAccess: true,
})

const log: string[] = []
let updated = 0
let skipped = 0

for (const doc of docs) {
  const authors = (doc.authors ?? []).map((a) => (typeof a === 'object' ? a.id : a))
  if (authors.includes(AUTHOR_ID)) {
    skipped++
    continue
  }
  if (!doc.title) {
    log.push(`SKIP (bez titulku): ${doc.id}`)
    skipped++
    continue
  }
  try {
    await payload.update({
      collection: 'posts',
      id: doc.id,
      depth: 0,
      overrideAccess: true,
      context: { disableRevalidate: true },
      data: {
        authors: [...authors, AUTHOR_ID],
        _status: doc._status === 'draft' ? 'draft' : 'published',
      },
    })
    updated++
    log.push(`OK ${doc.id} — ${doc.title}`)
  } catch (err) {
    log.push(`ERR ${doc.id} — ${doc.title}: ${(err as Error).message}`)
  }
}

log.push(`\nCelkem článků: ${docs.length}, aktualizováno: ${updated}, přeskočeno: ${skipped}`)
writeFileSync('migration/assign-authors.log', log.join('\n'))
