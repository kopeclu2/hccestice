/**
 * Text odpočtu, který se nedostane do extrahovaného obsahu stránky.
 *
 * Server a první render klienta kreslí „--" (viz `useCountdown`) a ten
 * by se jinak dostal do SSR HTML jako „-- dní -- hod -- min -- sek" — pro
 * vyhledávače a AI crawlery, které JavaScript nespouštějí, nesmyslný text
 * na místě, kde má být zápas. Dokud čas nedoběhl (`pending`), kreslí se
 * `text` přes CSS `content` (pseudo-element není v textu stránky), takže
 * šířka a výška zůstanou stejné a nevznikne posun layoutu.
 */
export function CountdownText({ pending, text }: { pending: boolean; text: string }) {
  if (!pending) return <>{text}</>
  return <span aria-hidden className="before:content-[attr(data-text)]" data-text={text} />
}
