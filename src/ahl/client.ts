import { AhlFetchError } from './errors'

export const AHL_USER_AGENT = 'HC Cestice web sync (+https://hccestice.cz)'

export type AhlRequestInfo = { url: string; status: number; ms: number }

export type AhlClientOptions = {
  fetchImpl?: typeof fetch
  /** pauza mezi požadavky — ahl.cz je malý web, nezatěžujeme ho */
  delayMs?: number
  timeoutMs?: number
  /** počet opakování po síťové chybě / 5xx (celkem retries + 1 pokusů) */
  retries?: number
  onRequest?: (info: AhlRequestInfo) => void
}

export type AhlClient = {
  get(url: string): Promise<string>
  /** počet odeslaných HTTP požadavků včetně opakování */
  readonly requestCount: number
}

const sleep = (ms: number) =>
  ms > 0 ? new Promise<void>((resolve) => setTimeout(resolve, ms)) : Promise.resolve()

export function createAhlClient(options: AhlClientOptions = {}): AhlClient {
  const { delayMs = 400, timeoutMs = 15000, retries = 1, onRequest } = options
  const fetchImpl = options.fetchImpl ?? fetch

  let requestCount = 0
  let lastFinishedAt = 0
  // Fronta: i když volající pustí víc get() naráz, na ahl.cz půjdou po sobě.
  let queue: Promise<unknown> = Promise.resolve()

  async function attempt(url: string): Promise<string> {
    const wait = lastFinishedAt + delayMs - Date.now()
    if (lastFinishedAt > 0) await sleep(wait)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const started = Date.now()
    requestCount += 1
    try {
      const res = await fetchImpl(url, {
        headers: { 'User-Agent': AHL_USER_AGENT, Accept: 'text/html' },
        signal: controller.signal,
        redirect: 'follow',
      })
      const ms = Date.now() - started
      onRequest?.({ url, status: res.status, ms })
      if (!res.ok) throw new AhlFetchError(url, res.status)
      return await res.text()
    } catch (err) {
      if (err instanceof AhlFetchError) throw err
      onRequest?.({ url, status: 0, ms: Date.now() - started })
      const reason = controller.signal.aborted ? `timeout ${timeoutMs} ms` : String(err)
      throw new AhlFetchError(url, 0, `ahl.cz ${url}: ${reason}`)
    } finally {
      clearTimeout(timer)
      lastFinishedAt = Date.now()
    }
  }

  async function run(url: string): Promise<string> {
    let lastError: unknown
    for (let i = 0; i <= retries; i++) {
      try {
        return await attempt(url)
      } catch (err) {
        lastError = err
        // 4xx je odpověď serveru, opakování by dopadlo stejně. Opakuje se jen
        // síť/timeout (status 0) a 5xx.
        const retryable = err instanceof AhlFetchError && (err.status === 0 || err.status >= 500)
        if (!retryable) throw err
      }
    }
    throw lastError
  }

  return {
    get(url: string) {
      const result = queue.then(() => run(url))
      queue = result.catch(() => undefined)
      return result
    },
    get requestCount() {
      return requestCount
    },
  }
}
