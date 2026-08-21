import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_landing_trainings" DROP CONSTRAINT "pages_blocks_landing_trainings_photo_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_landing_trainings" DROP CONSTRAINT "_pages_v_blocks_landing_trainings_photo_id_media_id_fk";
  
  DROP INDEX "pages_blocks_landing_trainings_photo_idx";
  DROP INDEX "_pages_v_blocks_landing_trainings_photo_idx";
  ALTER TABLE "pages_blocks_landing_trainings" DROP COLUMN "photo_id";
  ALTER TABLE "pages_blocks_landing_trainings" DROP COLUMN "photo_title";
  ALTER TABLE "pages_blocks_landing_trainings" DROP COLUMN "photo_subtitle";
  ALTER TABLE "pages_blocks_landing_trainings" DROP COLUMN "event_kicker";
  ALTER TABLE "pages_blocks_landing_trainings" DROP COLUMN "event_title";
  ALTER TABLE "pages_blocks_landing_trainings" DROP COLUMN "event_cta_label";
  ALTER TABLE "_pages_v_blocks_landing_trainings" DROP COLUMN "photo_id";
  ALTER TABLE "_pages_v_blocks_landing_trainings" DROP COLUMN "photo_title";
  ALTER TABLE "_pages_v_blocks_landing_trainings" DROP COLUMN "photo_subtitle";
  ALTER TABLE "_pages_v_blocks_landing_trainings" DROP COLUMN "event_kicker";
  ALTER TABLE "_pages_v_blocks_landing_trainings" DROP COLUMN "event_title";
  ALTER TABLE "_pages_v_blocks_landing_trainings" DROP COLUMN "event_cta_label";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_landing_trainings" ADD COLUMN "photo_id" integer;
  ALTER TABLE "pages_blocks_landing_trainings" ADD COLUMN "photo_title" varchar;
  ALTER TABLE "pages_blocks_landing_trainings" ADD COLUMN "photo_subtitle" varchar;
  ALTER TABLE "pages_blocks_landing_trainings" ADD COLUMN "event_kicker" varchar;
  ALTER TABLE "pages_blocks_landing_trainings" ADD COLUMN "event_title" varchar;
  ALTER TABLE "pages_blocks_landing_trainings" ADD COLUMN "event_cta_label" varchar;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD COLUMN "photo_id" integer;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD COLUMN "photo_title" varchar;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD COLUMN "photo_subtitle" varchar;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD COLUMN "event_kicker" varchar;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD COLUMN "event_title" varchar;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD COLUMN "event_cta_label" varchar;
  ALTER TABLE "pages_blocks_landing_trainings" ADD CONSTRAINT "pages_blocks_landing_trainings_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD CONSTRAINT "_pages_v_blocks_landing_trainings_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_landing_trainings_photo_idx" ON "pages_blocks_landing_trainings" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_landing_trainings_photo_idx" ON "_pages_v_blocks_landing_trainings" USING btree ("photo_id");`)
}
