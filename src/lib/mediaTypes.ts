/**
 * Přípony souborů, které smí nést upload do kolekce `media`, podle MIME typu.
 * Izomorfní, bez závislostí — používá ho hook kolekce i test.
 *
 * Proč to Payload nehlídá: u souborů, které se nepřevzorkovávají (PDF, mp3,
 * Office), bere příponu z názvu od klienta a MIME typ ověřuje jen podle
 * obsahu (`checkFileRestrictions`). `x.html` s hlavičkou MP3 tak projde,
 * uloží se jako `public/media/x.html` a Next ho jako statický soubor
 * servíruje s `Content-Type: text/html` — stored XSS z účtu editora.
 * Přípona proto musí odpovídat MIME typu a ne naopak.
 *
 * Obrázky sdílejí jednu množinu přípon: v produkčních datech jsou
 * `image/jpeg` s příponou `.png` i naopak (import z eStránky), a
 * nesoulad mezi dvěma obrázkovými příponami nic neotevírá.
 */

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'jpe', 'png', 'gif', 'webp', 'tif', 'tiff', 'ico'] as const

/** Klíč je MIME typ z `mimeTypes` v kolekci `media`; přípony bez tečky, malými. */
const EXTENSIONS_BY_MIME: Readonly<Record<string, readonly string[]>> = {
  'image/jpeg': IMAGE_EXTENSIONS,
  'image/png': IMAGE_EXTENSIONS,
  'image/gif': IMAGE_EXTENSIONS,
  'image/webp': IMAGE_EXTENSIONS,
  'image/tiff': IMAGE_EXTENSIONS,
  'image/x-icon': IMAGE_EXTENSIONS,
  'application/pdf': ['pdf'],
  'audio/mpeg': ['mp3'],
  'application/msword': ['doc'],
  // Starý binární kontejner Office (OLE/CFB): detekce nerozliší .doc od .xls.
  'application/x-cfb': ['doc', 'xls'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
}

/** Přípona bez tečky, malými; `''` když ji název nemá. */
function extensionOf(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? ''
  const dot = base.lastIndexOf('.')
  return dot <= 0 ? '' : base.slice(dot + 1).toLowerCase()
}

/**
 * Chybová zpráva, když přípona souboru neodpovídá jeho MIME typu (nebo typ
 * není povolený); `null`, když je vše v pořádku.
 */
export function checkUploadExtension(filename: string, mimeType: string): string | null {
  const essence = mimeType.split(';', 1)[0]?.trim().toLowerCase() ?? ''
  const allowed = EXTENSIONS_BY_MIME[essence]
  if (!allowed) return `Typ souboru „${mimeType || 'neznámý'}" není povolený.`

  const extension = extensionOf(filename)
  if (!allowed.includes(extension)) {
    return `Přípona „${extension ? `.${extension}` : '(žádná)'}" neodpovídá typu souboru ${essence}.`
  }
  return null
}

/** Kategorie, ve kterých má smysl otevřít soubor přímo v prohlížeči. */
const INLINE_MIME = /^(?:image|audio|video)\//

/**
 * Hlavičky, které se přidávají ke každému souboru z `media` — jak ke
 * statickému `/media/*` (`next.config.ts`), tak k `/api/media/file/*`
 * (`modifyResponseHeaders`). Soubor otevřený přímo (ne přes `<img>`) tak
 * nemůže spustit skript ani načíst cizí zdroje, i kdyby se podvržený obsah
 * dostal do prohlížeče s HTML typem.
 *
 * `sandbox` rozbíjí vestavěný prohlížeč PDF v Chrome (dokument v sandboxu
 * ho nenačte), takže PDF a Office soubory se místo toho vždy stahují
 * (`Content-Disposition: attachment`). Obrázky a zvuk zůstávají inline.
 */
export const MEDIA_CONTENT_SECURITY_POLICY =
  "sandbox; default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'"

export function mediaSecurityHeaders(contentType: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Security-Policy': MEDIA_CONTENT_SECURITY_POLICY,
  }
  const essence = (contentType ?? '').split(';', 1)[0]?.trim().toLowerCase() ?? ''
  if (!INLINE_MIME.test(essence)) headers['Content-Disposition'] = 'attachment'
  return headers
}

/**
 * Přípony, které se stahují místo zobrazení — pro statické `/media/*`, kde
 * `next.config.ts` typ neviděl a rozhoduje se podle přípony. Odvozeno
 * z téže mapy, takže nový typ v `mimeTypes` kolekce nezůstane bez hlavičky.
 */
export const MEDIA_DOWNLOAD_EXTENSIONS: readonly string[] = [
  ...new Set(
    Object.entries(EXTENSIONS_BY_MIME)
      .filter(([mime]) => !INLINE_MIME.test(mime))
      .flatMap(([, extensions]) => extensions),
  ),
]
