import { getPayload } from 'payload'
import config from '../src/payload.config'
const payload = await getPayload({ config })
const old = await payload.find({ collection: 'pages', where: { slug: { equals: 'ukazka-bloku' } }, limit: 1, depth: 0, draft: true })
if (old.docs[0]) { await payload.delete({ collection: 'pages', id: old.docs[0].id, context: { disableRevalidate: true } }); console.log('ukazka-bloku smazána') } else console.log('už neexistuje')
process.exit(0)
