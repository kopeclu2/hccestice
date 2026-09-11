import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

// Pořadí je záměrné: na Coolify je zdroj pravdy `NEXT_PUBLIC_SERVER_URL`
// (build variable). Kdyby se čtla až za Vercelem, `remotePatterns` níž by
// neobsahovaly produkční doménu a `next/image` by odmítl média z Payloadu.
const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000')

const nextConfig: NextConfig = {
  // Docker image nese jen `.next/standalone` + traced node_modules.
  // Bez tohohle přepínače `next build` standalone výstup nevytvoří
  // a Dockerfile spadne na chybějící cestě.
  output: 'standalone',
  // sharp má nativní binárky, které tracer podle importů nespolehlivě
  // najde — Payload jimi zpracovává každý upload.
  outputFileTracingIncludes: {
    '/*': ['node_modules/sharp/**/*'],
  },
  experimental: {
    // Prerender ~380 stránek: méně build workerů = méně pg poolů,
    // jinak build vyčerpá Postgres max_connections (chyba 53300).
    staticGenerationMinPagesPerWorker: 200,
  },
  // Temporarily required on Windows until Next.js fixes Turbopack Sass resolution.
  // See: https://github.com/vercel/next.js/issues/86431
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/logo-cestice.png',
      },
    ],
    /**
     * `qualities` tu záměrně **není**. V Next 16 defaultuje na `[75]` a
     * jakákoli jiná hodnota se přiklopí na nejbližší povolenou
     * (`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`).
     * Dřív tu bylo `[100]`, takže se na 100 přiklopily i obrázky, které
     * si žádnou kvalitu neříkaly — celý web servíroval JPEGy prakticky
     * bez komprese (ověřeno: 208 z 208 URL na produkci mělo `q=100`).
     *
     * `formats` taky ne: default je `['image/webp']`, což chceme. AVIF
     * kóduje o ~50 % dél a první request na každý obrázek by na 3,7GB
     * boxu bez swapu platil tu režii navíc.
     */
    /**
     * Default Next 16 je 4 hodiny (v 15 to byla minuta) — viz
     * `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`,
     * „`minimumCacheTTL` Default". Optimalizovaná varianta se tedy každé
     * 4 hodiny zahodila a sharp ji překódoval znovu, i když se obrázek
     * nezměnil.
     *
     * 31 dní je bezpečné jen díky verzi v URL: `getMediaUrl` přilepuje
     * `?<updatedAt>`, takže nový soubor má jiný cache klíč. Bez toho by
     * neexistoval způsob, jak optimalizovanou variantu invalidovat —
     * mechanismus na to Next nemá (`docs/…/image-legacy.md:594`).
     */
    minimumCacheTTL: 2678400,
    /**
     * Bez explicitní hodnoty si Next při startu vezme **50 % volného
     * místa na disku** (`docs/…/02-components/image.md`, sekce
     * `maximumDiskCacheSize`). Na produkčním boxu je 21 GB volných, takže
     * by cache obrázků směla vyrůst na ~10 GB a soutěžila by o místo
     * s Docker images, Postgresem a 4,8GB volume médií.
     *
     * 1 GB je s odstupem dost (optimalizují se jen skutečně zobrazené
     * varianty, ne všech 7 279 médií) a při překročení Next maže
     * nejdéle nepoužité položky.
     */
    maximumDiskCacheSize: 1_000_000_000,
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        }
      }),
    ],
  },
  /**
   * `webpack: (…)` tu **záměrně není**.
   *
   * Byl tu blok, který nastavoval `resolve.extensionAlias` (`.js` → `.ts`).
   * Od Next 16 je ale výchozím bundlerem Turbopack (mezi chunky je
   * `turbopack-*.js`), takže se ta konfigurace **tiše ignorovala** —
   * rozlišení přípon si Turbopack řeší sám. Dokumentace k tomu navíc říká,
   * že build s vlastní webpack konfigurací má selhat, aby se na to přišlo
   * (`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`,
   * „Turbopack by default"). Tady neselhával, takže to byl mrtvý kód, který
   * budil dojem funkční konfigurace.
   *
   * Pokud by někdy bylo nutné vrátit se k webpacku (`next build --webpack`),
   * je potřeba ten alias vrátit spolu s ním.
   */
  reactStrictMode: true,
  redirects,
  // Neinzerovat stack návštěvníkům ani skenerům (`X-Powered-By: Next.js, Payload`).
  poweredByHeader: false,
  /**
   * Bezpečnostní hlavičky. Web je zatím na HTTP, takže HSTS tu **není** —
   * `Strict-Transport-Security` bez TLS nemá co vynucovat a po přechodu na
   * klubovou doménu s certifikátem se doplní (fáze 6 plánu).
   *
   * `X-Frame-Options: SAMEORIGIN`, ne `DENY`: Payload vkládá frontend do
   * iframe v admin náhledu (live preview), `DENY` by ho rozbil.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          /**
           * Report-only záměrně: `script-src`/`style-src` musí povolit
           * `unsafe-inline` (Next.js inlinuje hydratační data a Payload
           * admin vlastní styly), takže reálné vynucení by dnes nechránilo
           * skoro proti ničemu a riskovalo rozbití admin UI, které audit
           * neprošel. Report-only jen loguje porušení do konzole/`report-to`
           * bez blokování — bezpečný první krok, ostré vynucení je
           * navazující úkol (nonce-based CSP).
           */
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "frame-src 'self' https://www.google.com",
              "connect-src 'self' https://www.google.com https://www.googletagmanager.com https://www.google-analytics.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

const payloadConfig = withPayload(nextConfig, { devBundleServerPackages: false })

/**
 * `withPayload` věší client hint pro barevné schéma na `source: '/:path*'`,
 * tedy i na celý veřejný web — viz
 * `node_modules/@payloadcms/next/dist/withPayload/withPayload.js`.
 *
 * Problém je `Critical-CH`: prohlížeč, který hint v prvním requestu
 * neposlal, musí navigaci **restartovat**, aby ho doposlal. V Lighthouse
 * trace je to `307 Internal Redirect` ještě před samotným HTML, takže to
 * platí každý první návštěvník a zdrží se tím úplně všechno za tím.
 *
 * Měřeno na produkci (Lighthouse 12, mobil, 3 běhy, medián):
 *
 * |            | FCP    | LCP    |
 * |------------|--------|--------|
 * | s restartem| 2,1 s  | 5,3 s  |
 * | bez        | 1,6 s  | 3,5 s  |
 *
 * Hint potřebuje jen administrace, která si podle něj serverově vybírá
 * téma. Veřejný web se řídí atributem `[data-theme]` (`globals.css`),
 * `prefers-color-scheme` nečte vůbec — hint mu je tedy k ničemu.
 *
 * Filtruje se podle **hodnoty**, ne podle názvu hlavičky: `Accept-CH`,
 * `Vary` i `Critical-CH` nesou tentýž `Sec-CH-Prefers-Color-Scheme`,
 * a filtr na klíč `vary` by mohl sebrat i cizí `Vary`, které tam přibude.
 */
const isColorSchemeHint = (header: { key: string; value: string }): boolean =>
  /sec-ch-prefers-color-scheme/i.test(header.value)

const payloadHeaders = payloadConfig.headers

payloadConfig.headers = async () => {
  const rules = (await payloadHeaders?.()) ?? []

  return rules.flatMap((rule) => {
    const hints = rule.headers.filter(isColorSchemeHint)
    if (hints.length === 0) return [rule]

    const rest = rule.headers.filter((header) => !isColorSchemeHint(header))

    return [
      ...(rest.length > 0 ? [{ ...rule, headers: rest }] : []),
      { ...rule, headers: hints, source: '/admin/:path*' },
    ]
  })
}

/**
 * `withSentryConfig` musí obalovat výsledek `withPayload`, ne holý `nextConfig` —
 * jinak by přišel o úpravu hlaviček výše. Upload source map (`org`/`project`/
 * `authToken`) se čte z env proměnných automaticky; bez `SENTRY_AUTH_TOKEN`
 * (lokální vývoj) plugin jen zaloguje varování a build pokračuje bez uploadu.
 */
export default withSentryConfig(payloadConfig, {
  silent: !process.env.CI,

  // Automaticky vytvoří rewrite na `/monitoring`, aby ad-blockery neblokovaly
  // odchozí požadavky na Sentry.
  tunnelRoute: '/monitoring',
})
