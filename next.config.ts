import { withPayload } from '@payloadcms/next/withPayload'
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
        ],
      },
    ]
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
