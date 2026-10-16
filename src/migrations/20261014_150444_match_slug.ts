import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Slug zápasu (`/zapasy/<slug>`). Sloupec se zakládá nullable, existující
 * zápasy dostanou slug SQL backfillem a teprve potom vznikne unikátní index
 * (index nad prázdnými hodnotami by sice prošel — `NULL`y se neporovnávají —,
 * ale chceme, aby případná kolize shodila migraci, ne běžící web).
 *
 * Formát musí sedět s `matchSlug()` v `src/lib/matchSlug.ts`:
 * `YYYY-MM-DD-<opponents.slug>` (den v Europe/Prague), bez slugu soupeře jen
 * den; u shody stejného dne a soupeře první zápas (podle data, id) bez
 * přípony, další `-2`, `-3`…
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "matches" ADD COLUMN "slug" varchar;
  UPDATE "matches" AS m
  SET "slug" = CASE WHEN r."rn" = 1 THEN r."base" ELSE r."base" || '-' || r."rn" END
  FROM (
  	SELECT b."id", b."base", row_number() OVER (PARTITION BY b."base" ORDER BY b."date", b."id") AS "rn"
  	FROM (
  		SELECT m2."id", m2."date",
  			to_char(m2."date" AT TIME ZONE 'Europe/Prague', 'YYYY-MM-DD') || COALESCE('-' || NULLIF(o."slug", ''), '') AS "base"
  		FROM "matches" m2
  		LEFT JOIN "opponents" o ON o."id" = m2."opponent_id"
  	) b
  ) r
  WHERE m."id" = r."id" AND m."slug" IS NULL;
  CREATE UNIQUE INDEX "matches_slug_idx" ON "matches" USING btree ("slug");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "matches_slug_idx";
  ALTER TABLE "matches" DROP COLUMN "slug";`)
}
