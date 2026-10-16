import { type NextRequest, NextResponse } from 'next/server'

import {
  MAINTENANCE_BYPASS_COOKIE,
  MAINTENANCE_RETRY_AFTER,
  PAYLOAD_TOKEN_COOKIE,
  decideMaintenance,
  isGatedPath,
} from '@/lib/maintenanceGate'

/**
 * Brána režimu údržby (Nastavení webu → Režim údržby).
 *
 * Běží před routou, takže funguje stejně pro prerenderované, ISR
 * i dynamické stránky a může vrátit správné HTTP 503 s `Retry-After`.
 * Dřív byla brána v root layoutu a u prerenderovaných stránek padala
 * na 500 — viz `src/lib/maintenanceGate.ts`.
 *
 * Stav si proxy čte z `/internal/maintenance` (tagovaná cache) a drží ho
 * pár vteřin v paměti procesu. Next upozorňuje, že globály proxy nejsou
 * spolehlivé (`proxy.md`) — tady je to jen optimalizace; v nejhorším se
 * stav načte znovu.
 *
 * Každá chyba otevírá web („fail open“): nedostupná interní routa nesmí
 * zavřít celý web.
 */

const FLAG_TTL_MS = 5_000
const SESSION_TTL_MS = 60_000
const FETCH_TIMEOUT_MS = 2_000

/** Standalone server poslouchá jen na IPv4 — `localhost` by šel na `::1` (AGENTS.md, Nasazení). */
const INTERNAL_ORIGIN = `http://127.0.0.1:${process.env.PORT ?? 3000}`

let flagMemo: { enabled: boolean; expires: number } | null = null
const sessionMemo = new Map<string, { authenticated: boolean; expires: number }>()

async function readState(path: string, cookie?: string) {
  const res = await fetch(`${INTERNAL_ORIGIN}${path}`, {
    cache: 'no-store',
    // `payload.auth` v interní route s nastaveným `csrf` bere cookie jen u requestu
    // s `Origin` ze seznamu, nebo (bez `Origin`) se `Sec-Fetch-Site` same-origin.
    // Tenhle interní fetch žádnou z hlaviček nenese, takže bez ní by správce
    // nikdy neprošel bránou. Je to volání proxy → vlastní route na loopbacku,
    // ne request prohlížeče, a rozhoduje se jím jen o zobrazení veřejného webu
    // (platnost tokenu pořád ověřuje podpis JWT).
    headers: cookie ? { cookie, 'sec-fetch-site': 'same-origin' } : undefined,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`/internal/maintenance → ${res.status}`)
  return (await res.json()) as { enabled: boolean; authenticated: boolean }
}

async function isEnabled(): Promise<boolean> {
  const now = Date.now()
  if (flagMemo && flagMemo.expires > now) return flagMemo.enabled
  const { enabled } = await readState('/internal/maintenance')
  flagMemo = { enabled, expires: now + FLAG_TTL_MS }
  return enabled
}

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(PAYLOAD_TOKEN_COOKIE)?.value
  if (!token) return false

  const now = Date.now()
  const hit = sessionMemo.get(token)
  if (hit && hit.expires > now) return hit.authenticated

  const { authenticated } = await readState(
    '/internal/maintenance?session=1',
    `${PAYLOAD_TOKEN_COOKIE}=${token}`,
  )
  // Paměť je jen pro pár přihlášených správců; při přetečení se zahodí celá.
  if (sessionMemo.size > 100) sessionMemo.clear()
  sessionMemo.set(token, { authenticated, expires: now + SESSION_TTL_MS })
  return authenticated
}

/**
 * HTML z `/udrzba` jde ven bez skriptů. Servíruje se na cizí URL
 * (`/zapasy`…), a kdyby se hydratoval, klientský router by v něm našel
 * strom routy `/udrzba` pod jinou adresou. Údržbová stránka JS nepotřebuje
 * — styly, font i obrázky (`<img srcset>`) fungují bez něj.
 */
function stripScripts(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b[^>]*\bas="script"[^>]*>/gi, '')
}

async function maintenanceResponse(req: NextRequest): Promise<NextResponse> {
  const headers = {
    'Cache-Control': 'no-store',
    'Retry-After': String(MAINTENANCE_RETRY_AFTER),
    'X-Robots-Tag': 'noindex',
  }

  // RSC požadavky klientského routeru (navigace, prefetch) nedostanou HTML:
  // router na chybový stav odpoví plnou navigací, a ta už skončí tady
  // s údržbovou stránkou.
  if (req.headers.has('rsc') || req.method !== 'GET') {
    return new NextResponse(null, { status: 503, headers })
  }

  const page = await fetch(`${INTERNAL_ORIGIN}/udrzba`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!page.ok) throw new Error(`/udrzba → ${page.status}`)

  return new NextResponse(stripScripts(await page.text()), {
    status: 503,
    headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function proxy(req: NextRequest) {
  if (!isGatedPath(req.nextUrl.pathname)) return NextResponse.next()

  try {
    const enabled = await isEnabled()
    const decision = decideMaintenance({
      enabled,
      authenticated: enabled ? await isAuthenticated(req) : false,
    })

    if (decision === 'block') return await maintenanceResponse(req)

    const res = NextResponse.next()
    if (decision === 'bypass') {
      res.cookies.set(MAINTENANCE_BYPASS_COOKIE, '1', { path: '/', sameSite: 'lax' })
    } else if (req.cookies.has(MAINTENANCE_BYPASS_COOKIE)) {
      res.cookies.delete(MAINTENANCE_BYPASS_COOKIE)
    }
    return res
  } catch (err) {
    console.error('[maintenance] brána selhala, web zůstává otevřený:', err)
    return NextResponse.next()
  }
}

export const config = {
  // Statické soubory, obrázky a cokoli s příponou (favicon, sitemapy,
  // `llms.txt`, legacy `*.html` — ty jen přesměrují na stránku, kterou
  // brána pak zachytí) proxy vůbec nespouští.
  matcher: ['/((?!_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)'],
}
