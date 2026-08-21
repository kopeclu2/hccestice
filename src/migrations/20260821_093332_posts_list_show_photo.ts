import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_landing_news" ALTER COLUMN "count" SET DEFAULT 3;
  ALTER TABLE "_pages_v_blocks_landing_news" ALTER COLUMN "count" SET DEFAULT 3;
  ALTER TABLE "site_config" ADD COLUMN "posts_list_show_photo" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_landing_news" ALTER COLUMN "count" SET DEFAULT 4;
  ALTER TABLE "_pages_v_blocks_landing_news" ALTER COLUMN "count" SET DEFAULT 4;
  ALTER TABLE "site_config" DROP COLUMN "posts_list_show_photo";`)
}
