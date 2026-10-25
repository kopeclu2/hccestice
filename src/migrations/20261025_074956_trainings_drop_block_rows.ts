import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_landing_trainings_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_trainings_rows" CASCADE;
  ALTER TABLE "pages_blocks_landing_trainings" DROP COLUMN "default_venue";
  ALTER TABLE "_pages_v_blocks_landing_trainings" DROP COLUMN "default_venue";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_landing_trainings_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" varchar,
  	"time" varchar,
  	"group" varchar,
  	"venue" varchar,
  	"note" varchar,
  	"joint" boolean DEFAULT false,
  	"hidden_on_web" boolean DEFAULT false
  );
  
  CREATE TABLE "_pages_v_blocks_landing_trainings_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" varchar,
  	"time" varchar,
  	"group" varchar,
  	"venue" varchar,
  	"note" varchar,
  	"joint" boolean DEFAULT false,
  	"hidden_on_web" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_blocks_landing_trainings" ADD COLUMN "default_venue" varchar;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD COLUMN "default_venue" varchar;
  ALTER TABLE "pages_blocks_landing_trainings_rows" ADD CONSTRAINT "pages_blocks_landing_trainings_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_landing_trainings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_trainings_rows" ADD CONSTRAINT "_pages_v_blocks_landing_trainings_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_landing_trainings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_landing_trainings_rows_order_idx" ON "pages_blocks_landing_trainings_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_trainings_rows_parent_id_idx" ON "pages_blocks_landing_trainings_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_trainings_rows_order_idx" ON "_pages_v_blocks_landing_trainings_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_trainings_rows_parent_id_idx" ON "_pages_v_blocks_landing_trainings_rows" USING btree ("_parent_id");`)
}
