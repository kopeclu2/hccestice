import type { FieldAccess } from 'payload'

/**
 * Field-level `update` access pro pole zápasu, která přepisuje synchronizace
 * z AHL.cz. Dokud je vyplněné `ahl.matchId`, je pole v adminu jen pro čtení —
 * jinak by ruční úprava zmizela při příštím běhu. Smazáním ID se zápas od AHL
 * „odpojí" a pole se zase odemknou.
 *
 * Ověřeno v `payload/dist/fields/hooks/beforeValidate/promise.js`:
 * - přístup se vyhodnocuje podle `operation`, takže při `create` se `update`
 *   vůbec nevolá a nový zápas jde založit ručně (i s `required` poli),
 * - `doc` je stav **před** uložením, takže vyplnění `matchId` a úprava polí
 *   v jednom uložení projde; zamkne se až další uložení,
 * - `row` je jen vizuální obal, `doc` je pořád celý dokument,
 * - zamčená hodnota se z příchozích dat zahodí a doplní se z uloženého
 *   dokumentu, takže `required` pole create/update nerozbije,
 * - Local API (synchronizační job) má `overrideAccess: true`, tedy se na něj
 *   tohle pravidlo nevztahuje.
 */
export const notSyncedFromAhl: FieldAccess = ({ doc }) => !doc?.ahl?.matchId
