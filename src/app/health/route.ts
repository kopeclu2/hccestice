/**
 * Healthcheck pro Coolify.
 *
 * Záměrně **nesahá do databáze**: web je z většiny prerenderovaný a při
 * krátkém výpadku Postgresu dál obsluhuje cache. Kdyby check na DB visel,
 * Coolify by kontejner označil za nezdravý a restartoval appku, která
 * zdravá je — výpadek by se tím jen prodloužil.
 *
 * Leží mimo route groupy, protože `/api/*` patří catch-all routě Payloadu
 * v `(payload)`.
 */
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json(
    { status: 'ok', uptime: Math.round(process.uptime()) },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
