import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_populated_authors" DROP COLUMN "email";
  ALTER TABLE "posts_populated_authors" DROP COLUMN "phone";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "email";
  ALTER TABLE "_posts_v_version_populated_authors" DROP COLUMN "phone";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_populated_authors" ADD COLUMN "email" varchar;
  ALTER TABLE "posts_populated_authors" ADD COLUMN "phone" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN "email" varchar;
  ALTER TABLE "_posts_v_version_populated_authors" ADD COLUMN "phone" varchar;`)
}
