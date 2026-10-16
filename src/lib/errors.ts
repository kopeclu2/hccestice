/**
 * Text chyby z `catch (e)` — `e` je `unknown`, takže nemusí být `Error`
 * (někdo hodí řetězec, objekt z knihovny). Žádná chyba se tu nesmí ztratit
 * ani shodit logování, proto `String(e)` jako záloha.
 */
export const errorMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e))
