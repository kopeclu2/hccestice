/**
 * Serializace JSON-LD do `<script type="application/ld+json">`.
 *
 * `JSON.stringify` neescapuje `<`, takže řetězec `</script>` v hodnotě
 * (jména střelců a soupeřů se scrapují z ahl.cz, texty článků píše redakce)
 * by uzavřel značku a zbytek by se vykreslil jako HTML. `<` je v JSON
 * stejná hodnota, parser ji vrátí zpět na `<`. Doporučení Next.js:
 * `node_modules/next/dist/docs/01-app/02-guides/json-ld.md`.
 */
export const serializeJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, '\\u003c')
