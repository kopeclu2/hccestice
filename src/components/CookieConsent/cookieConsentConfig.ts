import type { CookieConsentConfig } from 'vanilla-cookieconsent'

import { disableGoogleAnalytics, enableGoogleAnalytics } from './googleAnalytics'

/** `_ga`, `_ga_<container-id>` — obojí zakládá gtag.js pro GA4. */
const GA_COOKIE_PATTERN = /^_ga(_.*)?$/

const COOKIE_TABLE_HEADERS = {
  name: 'Název',
  domain: 'Poskytovatel',
  desc: 'Účel',
  exp: 'Platnost',
}

/**
 * `gaMeasurementId` je `null`, když `NEXT_PUBLIC_GA_MEASUREMENT_ID` není
 * vyplněné (lokální vývoj, projekt bez GA účtu) — kategorie „Analytické"
 * se pak vůbec nenabízí, aby v adminu i modálu nevisel přepínač bez služby
 * za sebou.
 */
export function buildCookieConsentConfig({
  gaMeasurementId,
}: {
  gaMeasurementId: string | null
}): CookieConsentConfig {
  return {
    /**
     * `opt-in` je výchozí hodnota knihovny, ale píše se sem explicitně —
     * je to jediný režim slučitelný s GDPR (čl. 7 odst. 4, žádné cookies
     * navíc bez aktivního souhlasu). `opt-out` by kategorie zapnul rovnou.
     */
    mode: 'opt-in',
    /**
     * Zvýšit při zásadní změně této konfigurace (nová kategorie/služba) —
     * knihovna pak i vrátivším se návštěvníkům s platným souhlasem znovu
     * zobrazí modál (`revisionMessage` v `consentModal` níže).
     */
    revision: 1,
    cookie: {
      name: 'cc_cookie',
    },
    guiOptions: {
      // `equalWeightButtons: true` (výchozí hodnota knihovny) drží „Přijmout
      // vše" a „Odmítnout" opticky stejně důležité — jinak by odmítnutí
      // vypadalo jako druhořadá volba, což řada DPA (včetně ÚOOÚ) považuje
      // za tzv. dark pattern.
      // Úzký pruh dole, ne karta: menší plocha lišty = menší šance, že ji Lighthouse
      // vezme za LCP prvek, a méně zakrývá obsah na mobilu.
      consentModal: { layout: 'bar inline', position: 'bottom' },
      preferencesModal: { layout: 'box', position: 'right' },
    },
    categories: {
      necessary: {
        readOnly: true,
      },
      ...(gaMeasurementId
        ? {
            analytics: {
              autoClear: {
                cookies: [{ name: GA_COOKIE_PATTERN }],
              },
              services: {
                ga: {
                  label: 'Google Analytics',
                  onAccept: () => {
                    void enableGoogleAnalytics(gaMeasurementId)
                  },
                  onReject: () => {
                    disableGoogleAnalytics(gaMeasurementId)
                  },
                  cookies: [{ name: GA_COOKIE_PATTERN }],
                },
              },
            },
          }
        : {}),
    },
    language: {
      default: 'cs',
      translations: {
        cs: {
          consentModal: {
            title: 'Cookies',
            // Zmínka o Google Analytics jen tehdy, když je služba opravdu zapnutá —
            // bez `gaMeasurementId` se žádná analytika nespouští a text by lhal.
            description: gaMeasurementId
              ? 'Nezbytné cookies používáme vždy, aby web fungoval. Se souhlasem navíc měříme anonymizovanou návštěvnost (Google Analytics). Volbu změníte kdykoli v patičce. <a href="/cookies">Více o cookies</a>'
              : 'Web používá jen nezbytné cookies: pamatují si vaši volbu a chrání formuláře před spamem. Volbu změníte kdykoli v patičce. <a href="/cookies">Více o cookies</a>',
            acceptAllBtn: 'Přijmout vše',
            acceptNecessaryBtn: 'Odmítnout',
            showPreferencesBtn: 'Předvolby',
          },
          preferencesModal: {
            title: 'Předvolby souhlasu s cookies',
            acceptAllBtn: 'Přijmout vše',
            acceptNecessaryBtn: 'Odmítnout vše',
            savePreferencesBtn: 'Uložit nastavení',
            closeIconLabel: 'Zavřít',
            serviceCounterLabel: 'služba|služby',
            sections: [
              {
                title: 'Používání cookies',
                description:
                  'Podrobný popis všech cookies a jejich účelu najdete v <a href="/cookies">zásadách používání cookies</a>.',
              },
              {
                title: 'Nezbytné cookies',
                description:
                  'Zajišťují základní funkčnost webu (zapamatování této volby) a ochranu formulářů proti spamu. Bez nich by web nefungoval správně, proto je nelze vypnout.',
                linkedCategory: 'necessary',
                cookieTable: {
                  headers: COOKIE_TABLE_HEADERS,
                  body: [
                    {
                      name: 'cc_cookie',
                      domain: 'tento web',
                      desc: 'Ukládá vaši volbu v tomto nastavení cookies.',
                      exp: '6 měsíců',
                    },
                    {
                      name: '_GRECAPTCHA',
                      domain: 'google.com',
                      desc: 'Google reCAPTCHA — ochrana formulářů proti spamu. Nastaví se jen při otevření formuláře.',
                      exp: '6 měsíců',
                    },
                  ],
                },
              },
              ...(gaMeasurementId
                ? [
                    {
                      title: 'Analytické cookies',
                      description:
                        'Pomáhají nám pochopit, jak návštěvníci web používají (Google Analytics 4). Použijí se jen s vaším souhlasem a lze je kdykoli odvolat.',
                      linkedCategory: 'analytics',
                      cookieTable: {
                        headers: COOKIE_TABLE_HEADERS,
                        body: [
                          {
                            name: '_ga',
                            domain: 'google.com',
                            desc: 'Rozlišuje jednotlivé návštěvníky pro měření návštěvnosti.',
                            exp: '13 měsíců',
                          },
                          {
                            name: '_ga_*',
                            domain: 'google.com',
                            desc: 'Uchovává stav relace pro Google Analytics 4.',
                            exp: '13 měsíců',
                          },
                        ],
                      },
                    },
                  ]
                : []),
            ],
          },
        },
      },
    },
  }
}
