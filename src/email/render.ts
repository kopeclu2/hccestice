/**
 * Sdílený layout transakčních e-mailů.
 *
 * Proč tabulkové HTML a inline styly: Outlook (Word engine) neumí flexbox ani
 * grid, Gmail zahazuje `<style>` v `<head>` u přeposlaných zpráv a žádný
 * klient neresolvuje CSS custom properties. Barvy proto jdou z hex zrcadla
 * `LANDING_COLORS` (viz komentář v `src/landing/tokens.ts`), ne z tokenů.
 *
 * Každá šablona vrací `{ html, text }`. Textová varianta není volitelná —
 * bez `text` části spamové filtry (a Seznam Email obzvlášť) skóre zhoršují.
 */
import { LANDING_COLORS as C } from '@/landing/tokens'

/** Řádek tabulky „odpovědi z formuláře". */
export type EmailRow = { label: string; value: string }

export type EmailContent = {
  /** Nadpis uvnitř karty. */
  heading: string
  /** Odstavce nad obsahem. */
  paragraphs?: string[]
  /**
   * Hotové HTML vložené pod odstavce — sem jde serializovaný Lexical
   * z form-builderu. NEescapuje se, volající ručí za obsah.
   */
  bodyHtml?: string
  /** Tabulka štítek–hodnota (odpovědi z formuláře). */
  rows?: EmailRow[]
  button?: { href: string; label: string }
  /** Malý text nad patičkou (kontext, ne právní doložka). */
  footnote?: string
  /**
   * Text, který klienti zobrazí v náhledu vedle předmětu. Když chybí,
   * vezme se první odstavec — jinak by náhled ukázal začátek patičky.
   */
  preheader?: string
}

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * Escapování pro interpolaci do HTML.
 *
 * Vlastní implementace místo balíčku `escape-html`: ten je v `node_modules`
 * jen jako tranzitivní závislost form-builderu (`@types/escape-html`
 * v devDependencies je pozůstatek Payload šablony), takže import by se rozbil
 * při každém přeskládání závislostí.
 */
export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] as string)

/** Písmo: webfont v e-mailu nespoléhavý, Geist tedy jen jako první volba. */
const FONT = "Geist, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"

const WRAPPER = `margin:0;padding:0;background-color:${C.paper};`

/** Neviditelný preheader. Kombinace tří vlastností pokrývá Gmail i Outlook. */
const preheaderHtml = (text: string) =>
  `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(text)}</div>`

const headerHtml = (clubName: string) => `
      <tr>
        <td style="background-color:${C.ink};padding:24px 32px;border-bottom:4px solid ${C.lime};border-radius:12px 12px 0 0;">
          <span style="font-family:${FONT};font-size:18px;font-weight:700;letter-spacing:0.02em;color:#ffffff;">${escapeHtml(clubName)}</span>
        </td>
      </tr>`

const rowsHtml = (rows: EmailRow[]) => `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:8px 0 0;">
                ${rows
                  .map(
                    (row) => `<tr>
                  <td style="padding:12px 0;border-top:1px solid ${C['line-mid']};font-family:${FONT};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${C.faint};width:34%;vertical-align:top;">${escapeHtml(row.label)}</td>
                  <td style="padding:12px 0;border-top:1px solid ${C['line-mid']};font-family:${FONT};font-size:15px;line-height:1.5;color:${C.ink};vertical-align:top;">${escapeHtml(row.value).replace(/\n/g, '<br />')}</td>
                </tr>`,
                  )
                  .join('\n                ')}
              </table>`

/**
 * Tlačítko jako tabulka, ne `<a>` s paddingem: Outlook padding na inline
 * prvku ignoruje a tlačítko by se scvrklo na podtržený odkaz.
 */
const buttonHtml = (button: { href: string; label: string }) => `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
                <tr>
                  <td align="center" bgcolor="${C.club}" style="border-radius:8px;">
                    <a href="${escapeHtml(button.href)}" style="display:inline-block;padding:14px 26px;font-family:${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(button.label)}</a>
                  </td>
                </tr>
              </table>`

const footerHtml = (clubName: string, siteUrl: string) => `
      <tr>
        <td style="padding:24px 32px 0;">
          <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.faint};">
            Tento e-mail odeslal web <a href="${escapeHtml(siteUrl)}" style="color:${C['club-dark']};text-decoration:none;">${escapeHtml(clubName)}</a>.
          </p>
        </td>
      </tr>`

export type RenderEmailArgs = EmailContent & {
  clubName: string
  siteUrl: string
}

/** Sestaví HTML tělo e-mailu. */
export function renderEmailHtml({
  bodyHtml,
  button,
  clubName,
  footnote,
  heading,
  paragraphs = [],
  preheader,
  rows,
  siteUrl,
}: RenderEmailArgs): string {
  const preview = preheader ?? paragraphs[0] ?? heading

  return `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <!-- Bez tohohle Outlook.com i Gmail v tmavém režimu barvy invertují a lime na bílé je nečitelná. -->
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="${WRAPPER}">
    ${preheaderHtml(preview)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.paper};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;">
${headerHtml(clubName)}
            <tr>
              <td style="background-color:#ffffff;border:1px solid ${C['line-mid']};border-top:none;border-radius:0 0 12px 12px;padding:32px;">
                <h1 style="margin:0 0 16px;font-family:${FONT};font-size:22px;line-height:1.3;font-weight:700;color:${C.ink};">${escapeHtml(heading)}</h1>
${paragraphs
  .map(
    (paragraph) =>
      `                <p style="margin:0 0 12px;font-family:${FONT};font-size:15px;line-height:1.65;color:${C.dim};">${escapeHtml(paragraph)}</p>`,
  )
  .join('\n')}
${bodyHtml ? `                <div style="font-family:${FONT};font-size:15px;line-height:1.65;color:${C.ink};">${bodyHtml}</div>` : ''}
${rows?.length ? rowsHtml(rows) : ''}
${button ? buttonHtml(button) : ''}
${
  footnote
    ? `                <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${C['line-mid']};font-family:${FONT};font-size:13px;line-height:1.6;color:${C.faint};">${escapeHtml(footnote)}</p>`
    : ''
}
              </td>
            </tr>
${footerHtml(clubName, siteUrl)}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/** Převede HTML odstavce z Lexicalu na řádky plain textu. */
const htmlToText = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    // Odstavec končí prázdným řádkem, ostatní bloky jen zlomem — jinak by
    // dva odstavce z Lexicalu v textové verzi splynuly do jednoho.
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/(div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()

/** Textová alternativa téhož obsahu. */
export function renderEmailText({
  bodyHtml,
  button,
  clubName,
  footnote,
  heading,
  paragraphs = [],
  rows,
  siteUrl,
}: RenderEmailArgs): string {
  // Skládá se po blocích oddělených prázdným řádkem, ne po řádcích: prázdný
  // řádek jako položka pole by neprošel filtrem chybějících sekcí.
  return [
    heading,
    paragraphs.join('\n\n'),
    bodyHtml ? htmlToText(bodyHtml) : '',
    rows?.length ? rows.map((row) => `${row.label}: ${row.value}`).join('\n') : '',
    button ? `${button.label}: ${button.href}` : '',
    footnote ?? '',
    `— ${clubName}, ${siteUrl}`,
  ]
    .filter((block) => block !== '')
    .join('\n\n')
}

/** HTML i text naráz — v šablonách se nikdy nemá volat jen jedno. */
export function renderEmail(args: RenderEmailArgs): { html: string; text: string } {
  return { html: renderEmailHtml(args), text: renderEmailText(args) }
}
