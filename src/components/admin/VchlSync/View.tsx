import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'

import { VchlSyncPanel } from './Panel'

/**
 * Ovládací stránka synchronizace s AHL.cz (`/admin/vchl-sync`).
 *
 * Custom view, který nepřebírá žádnou vestavěnou stránku, Payload sám
 * neobalí šablonou (`templateType` zůstane prázdný), takže navigaci
 * a hlavičku adminu dodává `DefaultTemplate` tady. Data si panel dotahuje
 * z `/api/vchl-sync/*` na klientu — běh umí trvat desítky sekund a stránka
 * se kvůli tomu nesmí zasekávat v SSR.
 */
export async function VchlSyncView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, locale, permissions, visibleEntities } = initPageResult
  if (!req.user) redirect('/admin/login?redirect=/admin/vchl-sync')

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        {/* SENTRY_ORG je serverová proměnná, do klienta jde jen jako prop. */}
        <VchlSyncPanel sentryOrg={process.env.SENTRY_ORG || null} />
      </Gutter>
    </DefaultTemplate>
  )
}
