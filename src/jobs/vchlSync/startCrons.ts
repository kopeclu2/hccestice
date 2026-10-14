import * as Sentry from '@sentry/nextjs'

/**
 * Nastartuje plánovač jobů Payloadu hned při startu serveru.
 *
 * Crony Payloadu (`_initializeCrons`) se spustí jen tehdy, když se
 * `getPayload` poprvé zavolá s `cron: true`. To dělá jen `initReq` z
 * `@payloadcms/next` (request do adminu nebo API); frontend volá
 * `getPayload({ config })` bez cronu a `/health` Payload nevolá vůbec. Po
 * každém redeployi by cron stál, dokud někdo neotevře admin — synchronizace
 * (a úklid auditního logu) by běžela „někdy".
 *
 * Volá se z `instrumentation.ts` jen v `nodejs` runtime. Nesmí shodit start
 * serveru ani ho zdržet (DB může být ještě nahoře), proto se nečeká na
 * dokončení a chyby jdou do Sentry. Opakované `getPayload` z requestů vrací
 * tutéž instanci, takže se crony nezdvojí.
 */
export async function startPayloadCrons(): Promise<void> {
  try {
    // Dynamicky: Payload config nesmí do bundlu, který se načítá i v edge.
    const [{ getPayload }, { default: config }] = await Promise.all([
      import('payload'),
      import('@payload-config'),
    ])
    await getPayload({ config, cron: true })
  } catch (err) {
    console.error('[vchl-sync] start cronů selhal', err)
    Sentry.captureException(err, { tags: { 'vchl.stage': 'startup' } })
  }
}
