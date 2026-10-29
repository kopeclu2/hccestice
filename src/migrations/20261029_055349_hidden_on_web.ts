import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "matches" ADD COLUMN "hidden_on_web" boolean DEFAULT false;
  ALTER TABLE "matches" ADD COLUMN "ahl_hidden_by_sync" boolean;
  CREATE INDEX "matches_hidden_on_web_idx" ON "matches" USING btree ("hidden_on_web");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "matches_hidden_on_web_idx";
  ALTER TABLE "matches" DROP COLUMN "hidden_on_web";
  ALTER TABLE "matches" DROP COLUMN "ahl_hidden_by_sync";`)
}
