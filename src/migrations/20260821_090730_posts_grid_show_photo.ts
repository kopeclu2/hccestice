import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_posts_grid" ADD COLUMN "show_photo" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_posts_grid" ADD COLUMN "show_photo" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_posts_grid" DROP COLUMN "show_photo";
  ALTER TABLE "_pages_v_blocks_posts_grid" DROP COLUMN "show_photo";`)
}
