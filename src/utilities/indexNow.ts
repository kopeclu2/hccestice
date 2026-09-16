import { getServerSideURL } from './getURL'

/**
 * IndexNow je společný protokol Bingu, Seznamu, Yandexu a Naveru — jedno
 * volání `api.indexnow.org` je rozešle všem zapojeným enginům najednou
 * (na rozdíl od `sitemap.xml`, na který čekají, než na stránku znovu
 * narazí při crawlování). Seznam.cz je tu obzvlášť relevantní, protože
 * cílová skupina klubu je česká.
 *
 * Klíč nepotřebuje být tajný — jeho jediná role je dokázat vlastnictví
 * domény, stejně jako u ověřovacích souborů Google Search Console.
 * Ověřuje se tím, že je dostupný na `https://<doména>/<klíč>.txt`
 * (`public/c4c8f2c4fb987bf31f050972b1c73c5d.txt`) se stejnou hodnotou
 * jako obsah. Musí to být pevná hodnota, ne generovaná za běhu — jinak by
 * se při každém restartu rozešla s už nasazeným souborem.
 */
const INDEXNOW_KEY = 'c4c8f2c4fb987bf31f050972b1c73c5d'

/**
 * Zavolat jen z `afterChange`/`afterDelete` hooků kolekcí, které mají
 * veřejnou cestu (`posts`, `pages`, `galleries`) — ne pro pomocné
 * dokumenty bez vlastní URL.
 *
 * Mimo produkci se přeskakuje ze stejného důvodu jako reCAPTCHA
 * (`src/utilities/recaptcha/config.ts`): dev a seed běhy nemají nahlašovat
 * lokální/testovací URL cizím vyhledávačům. Chyby se polykají — IndexNow
 * je doplňková signalizace, nesmí shodit uložení dokumentu v adminu.
 */
export const pingIndexNow = (paths: string[], logger?: { warn: (m: string) => void }): void => {
  if (process.env.NODE_ENV !== 'production' || paths.length === 0) return

  const host = new URL(getServerSideURL()).host

  fetch('https://api.indexnow.org/indexnow', {
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${getServerSideURL()}/${INDEXNOW_KEY}.txt`,
      urlList: paths.map((path) => `${getServerSideURL()}${path}`),
    }),
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    method: 'POST',
  }).catch((error: unknown) => {
    logger?.warn(`IndexNow ping selhal: ${error instanceof Error ? error.message : String(error)}`)
  })
}
