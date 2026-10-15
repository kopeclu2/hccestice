import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_config_match_header_variant" AS ENUM('classic', 'arena', 'editorial', 'split', 'app');
  ALTER TABLE "site_config" ADD COLUMN "match_header_variant" "enum_site_config_match_header_variant" DEFAULT 'classic' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_config" DROP COLUMN "match_header_variant";
  DROP TYPE "public"."enum_site_config_match_header_variant";`)
}
