import type { CollectionAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
  // Import skripty běží mimo Next runtime — revalidace tam není dostupná
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating redirects`)

    revalidateTag('redirects', 'max')
  }

  return doc
}
