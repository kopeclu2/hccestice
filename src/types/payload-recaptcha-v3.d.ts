/**
 * Typy pro `payload-recaptcha-v3`.
 *
 * Balíček má chybu v packagingu: `package.json#types` míří na
 * `./dist/index.d.ts`, ale deklarace se buildí do `./dist/src/*.d.ts`.
 * TS tedy modul vidí jako implicit `any`.
 *
 * Mapovat cestu přes `tsconfig#paths` **nejde** — alias se použije i pro
 * runtime resolution (bun i turbopack) a Next pak importuje `.d.ts` soubor
 * a padá na `TypeError: (void 0) is not a function`. Proto ambientní
 * deklarace opsaná z `node_modules/payload-recaptcha-v3/dist/src/types.d.ts`
 * (verze 3.1.1) — při updatu balíčku zkontrolovat, že se API nerozešlo.
 */
declare module 'payload-recaptcha-v3' {
  import type { CollectionBeforeOperationHook, Operation, Plugin } from 'payload'

  export type reCAPTCHASkip = (args: Parameters<CollectionBeforeOperationHook>[0]) => boolean

  export interface reCAPTCHAResponse {
    success: boolean
    score: number
    action: string
    challenge_ts: number
    hostname: string
    'error-codes'?: string[]
  }

  export type reCAPTCHAErrorHandler = (args: {
    hookArgs: Parameters<CollectionBeforeOperationHook>[0]
    response?: reCAPTCHAResponse
    error?: unknown
  }) => unknown

  export interface reCAPTCHAConfig {
    errorHandler?: reCAPTCHAErrorHandler
    skip?: reCAPTCHASkip
    /** 0–1, default 0.7. */
    scoreThreshold?: number
  }

  export interface reCAPTCHAPluginConfig extends reCAPTCHAConfig {
    secret: string
  }

  /** Zapisuje se do `collection.custom.recaptcha`. */
  export interface reCAPTCHAOperation extends reCAPTCHAConfig {
    name: Operation
    action: string
  }

  const reCAPTCHAv3: (config: reCAPTCHAPluginConfig) => Plugin
  export default reCAPTCHAv3
}
