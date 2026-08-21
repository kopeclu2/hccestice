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
    qualities: [100],
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
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
