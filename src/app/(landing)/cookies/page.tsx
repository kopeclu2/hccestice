import type { Metadata } from 'next'

import React from 'react'

import { PageTitle } from '@/landing/components/Heading'
import { SectionShell } from '@/landing/components/SectionShell'
import { SubpageShell } from '@/landing/components/SubpageShell'
import { fetchSite } from '@/landing/data/site'

export const revalidate = 600

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/**
 * Zásady používání cookies a ochrany osobních údajů — jediné místo, kam
 * odkazuje `consentModal.footer` i patička (`LandingFooter`).
 *
 * Obsah je ručně psaný, ne z CMS: v `pages` by šlo o dokument, který musí
 * zůstat v souladu s tím, co web skutečně dělá (`CookieConsentInit`,
 * `next.config.ts` CSP, `src/instrumentation*.ts`) — kdyby si ho správce mohl
 * v adminu upravit nezávisle na kódu, rozešly by se.
 *
 * Kategorie/cookie tabulka duplikuje `cookieConsentConfig.ts` záměrně — jsou
 * to dva různé kontexty (modál vs. samostatná stránka), ne jeden zdroj dat
 * s abstrakcí navíc kvůli dvěma použitím.
 */
export default async function CookiesPage() {
  const site = await fetchSite()

  return (
    <SubpageShell>
      <SectionShell spacing="header">
        <PageTitle size="sm">Ochrana osobních údajů a cookies</PageTitle>
        <p className="mt-3 text-caption text-dim">Naposledy aktualizováno 10. 9. 2026</p>
      </SectionShell>

      <SectionShell spacing="content">
        <div className="article-prose max-w-190">
          <h2>Kdo je správcem osobních údajů</h2>
          <p>
            Správcem osobních údajů je <strong>TJ Sokol Čestice, z. s.</strong>, provozovatel
            hokejového klubu HC Čestice a tohoto webu. V otázkách ochrany osobních údajů nás
            můžete kontaktovat na{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>

          <h2>Jaké cookies web používá</h2>
          <p>
            Cookies rozdělujeme do dvou kategorií. Svou volbu můžete kdykoli změnit tlačítkem{' '}
            <button
              className="text-club underline underline-offset-2"
              data-cc="show-preferencesModal"
              type="button"
            >
              Nastavení cookies
            </button>{' '}
            v patičce webu.
          </p>

          <h3>Nezbytné cookies</h3>
          <p>
            Zajišťují základní funkčnost webu. Nelze je vypnout, protože bez nich web nefunguje
            správně — právním základem je oprávněný zájem provozovatele na chodu webu
            (čl. 6 odst. 1 písm. f GDPR), souhlas se pro ně nevyžaduje.
          </p>
          <table>
            <thead>
              <tr>
                <th>Název</th>
                <th>Poskytovatel</th>
                <th>Účel</th>
                <th>Platnost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>cc_cookie</td>
                <td>tento web</td>
                <td>Ukládá vaši volbu v nastavení cookies.</td>
                <td>6 měsíců</td>
              </tr>
              <tr>
                <td>_GRECAPTCHA</td>
                <td>Google (reCAPTCHA)</td>
                <td>
                  Ochrana kontaktního a objednávkového formuláře proti spamu a automatizovaným
                  odesláním. Nastaví se jen při otevření formuláře.
                </td>
                <td>6 měsíců</td>
              </tr>
            </tbody>
          </table>

          {GA_MEASUREMENT_ID && (
            <>
              <h3>Analytické cookies</h3>
              <p>
                Používáme je jen s vaším souhlasem k anonymizovanému měření návštěvnosti
                (Google Analytics 4), abychom věděli, které stránky lidi zajímají. Souhlas lze
                kdykoli odvolat — data ze štítku pak přestanou odcházet a existující cookies se
                smažou.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Název</th>
                    <th>Poskytovatel</th>
                    <th>Účel</th>
                    <th>Platnost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>_ga</td>
                    <td>Google Analytics</td>
                    <td>Rozlišuje jednotlivé návštěvníky.</td>
                    <td>13 měsíců</td>
                  </tr>
                  <tr>
                    <td>_ga_*</td>
                    <td>Google Analytics</td>
                    <td>Uchovává stav relace pro měření návštěvnosti.</td>
                    <td>13 měsíců</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          <h2>Další zpracování osobních údajů</h2>

          <h3>Kontaktní a objednávkový formulář</h3>
          <p>
            Údaje, které nám pošlete formulářem (jméno, e-mail, případně telefon a zpráva),
            zpracováváme jen za účelem vyřízení vašeho dotazu nebo objednávky — právním základem
            je jednání o smlouvě, případně náš oprávněný zájem na vyřízení dotazu
            (čl. 6 odst. 1 písm. b a f GDPR). Zprávu doručujeme prostřednictvím e-mailové služby
            (Resend, nebo SMTP dle konfigurace) a uchováváme ji jen po dobu nezbytnou k vyřízení
            a případné dokumentaci komunikace.
          </p>

          <h3>Monitoring chyb (Sentry)</h3>
          <p>
            Pro včasné odhalení technických chyb webu používáme službu Sentry (Functional
            Software, Inc., USA). Ve výchozím nastavení neodesílá IP adresy ani jiné osobní údaje
            z požadavků — zaznamenává jen technické informace o chybě (typ, zprávu, kód).
            Nejde o sledování návštěvníků, proto toto zpracování nevyžaduje souhlas; provádíme
            ho na základě oprávněného zájmu na bezchybném chodu webu.
          </p>

          <h2>Vaše práva</h2>
          <p>Ve vztahu ke svým osobním údajům máte právo na:</p>
          <ul>
            <li>přístup k osobním údajům a informace o jejich zpracování,</li>
            <li>opravu nepřesných nebo neúplných údajů,</li>
            <li>výmaz údajů, pokud pro jejich zpracování pomine důvod,</li>
            <li>omezení zpracování,</li>
            <li>přenositelnost údajů,</li>
            <li>vznesení námitky proti zpracování založenému na oprávněném zájmu,</li>
            <li>kdykoli odvolat souhlas s analytickými cookies, aniž je tím dotčena zákonnost zpracování před odvoláním.</li>
          </ul>
          <p>
            Svá práva můžete uplatnit na <a href={`mailto:${site.email}`}>{site.email}</a>. Pokud
            se domníváte, že vaše osobní údaje zpracováváme v rozporu s právními předpisy, máte
            právo podat stížnost u Úřadu pro ochranu osobních údajů (uoou.cz).
          </p>
        </div>
      </SectionShell>
    </SubpageShell>
  )
}

export const metadata: Metadata = {
  title: 'Ochrana osobních údajů a cookies | HC Čestice',
  description:
    'Jaké cookies HC Čestice používá, k čemu slouží a jak můžete svůj souhlas kdykoli změnit.',
  alternates: { canonical: '/cookies' },
}
