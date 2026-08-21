import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_config" ADD COLUMN "maintenance_enabled" boolean DEFAULT false;
  ALTER TABLE "site_config" ADD COLUMN "maintenance_headline" varchar;
  ALTER TABLE "site_config" ADD COLUMN "maintenance_perex" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_config" DROP COLUMN "maintenance_enabled";
  ALTER TABLE "site_config" DROP COLUMN "maintenance_headline";
  ALTER TABLE "site_config" DROP COLUMN "maintenance_perex";`)
}
