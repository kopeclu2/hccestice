import { ValidationError } from 'payload'
import type { CollectionBeforeValidateHook } from 'payload'

import { checkUploadExtension } from '@/lib/mediaTypes'

/**
 * Přípona nahrávaného souboru musí odpovídat jeho MIME typu (viz
 * `lib/mediaTypes` — Payload příponu bere od klienta a typ ověřuje jen
 * podle obsahu). Běží po `generateFileData`, takže `filename` je už
 * bezpečný název, pod kterým by se soubor uložil, a `mimeType` zjištěný
 * typ; k zápisu na disk dochází až po úspěšném uložení dokumentu.
 *
 * Kontroluje se jen při skutečném nahrání (`req.file`): úprava `alt` nebo
 * popisku staršího média (v databázi jsou záznamy bez přípony, např.
 * `.htaccess` z importu) nesmí selhat kvůli souboru, který se nemění.
 */
export const validateMediaUpload: CollectionBeforeValidateHook = ({ data, req }) => {
  if (!req.file || !data) return data

  const filename = typeof data.filename === 'string' ? data.filename : req.file.name
  const mimeType = typeof data.mimeType === 'string' ? data.mimeType : (req.file.mimetype ?? '')

  const problem = checkUploadExtension(filename, mimeType)
  if (problem) {
    throw new ValidationError({
      errors: [{ message: problem, path: 'file' }],
    })
  }
  return data
}
