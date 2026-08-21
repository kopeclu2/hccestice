import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_landing_trainings_rows" ALTER COLUMN "joint" SET DEFAULT false;
  ALTER TABLE "_pages_v_blocks_landing_trainings_rows" ALTER COLUMN "joint" SET DEFAULT false;
  ALTER TABLE "pages_blocks_landing_trainings_rows" ADD COLUMN "venue" varchar;
  ALTER TABLE "pages_blocks_landing_trainings_rows" ADD COLUMN "note" varchar;
  ALTER TABLE "pages_blocks_landing_trainings_rows" ADD COLUMN "hidden_on_web" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_landing_trainings" ADD COLUMN "kicker" varchar;
  ALTER TABLE "pages_blocks_landing_trainings" ADD COLUMN "default_venue" varchar;
  ALTER TABLE "_pages_v_blocks_landing_trainings_rows" ADD COLUMN "venue" varchar;
  ALTER TABLE "_pages_v_blocks_landing_trainings_rows" ADD COLUMN "note" varchar;
  ALTER TABLE "_pages_v_blocks_landing_trainings_rows" ADD COLUMN "hidden_on_web" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD COLUMN "kicker" varchar;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD COLUMN "default_venue" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_landing_trainings_rows" ALTER COLUMN "joint" DROP DEFAULT;
  ALTER TABLE "_pages_v_blocks_landing_trainings_rows" ALTER COLUMN "joint" DROP DEFAULT;
  ALTER TABLE "pages_blocks_landing_trainings_rows" DROP COLUMN "venue";
  ALTER TABLE "pages_blocks_landing_trainings_rows" DROP COLUMN "note";
  ALTER TABLE "pages_blocks_landing_trainings_rows" DROP COLUMN "hidden_on_web";
  ALTER TABLE "pages_blocks_landing_trainings" DROP COLUMN "kicker";
  ALTER TABLE "pages_blocks_landing_trainings" DROP COLUMN "default_venue";
  ALTER TABLE "_pages_v_blocks_landing_trainings_rows" DROP COLUMN "venue";
  ALTER TABLE "_pages_v_blocks_landing_trainings_rows" DROP COLUMN "note";
  ALTER TABLE "_pages_v_blocks_landing_trainings_rows" DROP COLUMN "hidden_on_web";
  ALTER TABLE "_pages_v_blocks_landing_trainings" DROP COLUMN "kicker";
  ALTER TABLE "_pages_v_blocks_landing_trainings" DROP COLUMN "default_venue";`)
}
