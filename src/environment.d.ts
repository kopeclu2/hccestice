declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      CRON_SECRET?: string
      PREVIEW_SECRET?: string
      /** Google reCAPTCHA v3 — bez klíčů se ověření mimo produkci přeskakuje. */
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY?: string
      RECAPTCHA_SECRET?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
