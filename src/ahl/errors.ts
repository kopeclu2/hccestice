/**
 * Stránka nemá tvar, který parser očekává. Záměrně hlasitá: ahl.cz u
 * neexistujícího zápasu vrací HTTP 200 s chybovou stránkou, takže bez
 * kontroly struktury by sync tiše „úspěšně" nezapsal nic.
 */
export class AhlParseError extends Error {
  readonly page: string
  readonly reason: string

  constructor(page: string, reason: string) {
    super(`ahl.cz ${page}: ${reason}`)
    this.name = 'AhlParseError'
    this.page = page
    this.reason = reason
  }
}

/** Selhal HTTP požadavek (status 0 = síť/timeout). */
export class AhlFetchError extends Error {
  readonly status: number
  readonly url: string

  constructor(url: string, status: number, message?: string) {
    super(message ?? `ahl.cz ${url}: HTTP ${status}`)
    this.name = 'AhlFetchError'
    this.status = status
    this.url = url
  }
}
