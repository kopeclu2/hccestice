'use client'

import * as CookieConsent from 'vanilla-cookieconsent'

import { useEffect } from 'react'

import { buildCookieConsentConfig } from './cookieConsentConfig'

import 'vanilla-cookieconsent/dist/cookieconsent.css'

/**
 * `CookieConsent.run()` musí běžet po mountu (čte/zapisuje `document.cookie`
 * a vykresluje modál do `document.body`), proto je celá komponenta jen
 * `useEffect` bez vlastního výstupu — modál si knihovna připojí sama.
 *
 * `gaMeasurementId` čte server layout z `NEXT_PUBLIC_GA_MEASUREMENT_ID`
 * (zapečené do bundlu při buildu) a posílá ho sem jako prop, aby konfigurace
 * kategorií/služeb žila na jednom místě (`cookieConsentConfig.ts`).
 */
export function CookieConsentInit({ gaMeasurementId }: { gaMeasurementId: string | null }) {
  useEffect(() => {
    void CookieConsent.run(buildCookieConsentConfig({ gaMeasurementId }))
  }, [gaMeasurementId])

  return null
}
