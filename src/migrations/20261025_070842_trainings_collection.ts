import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "trainings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"ends_at" timestamp(3) with time zone,
  	"season_id" integer,
  	"group" varchar,
  	"venue" varchar,
  	"note" varchar,
  	"joint" boolean DEFAULT false,
  	"hidden_on_web" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "trainings_id" integer;
  ALTER TABLE "trainings" ADD CONSTRAINT "trainings_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "trainings_date_idx" ON "trainings" USING btree ("date");
  CREATE INDEX "trainings_season_idx" ON "trainings" USING btree ("season_id");
  CREATE INDEX "trainings_updated_at_idx" ON "trainings" USING btree ("updated_at");
  CREATE INDEX "trainings_created_at_idx" ON "trainings" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trainings_fk" FOREIGN KEY ("trainings_id") REFERENCES "public"."trainings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_trainings_id_idx" ON "payload_locked_documents_rels" USING btree ("trainings_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trainings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "trainings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_trainings_fk";
  
  DROP INDEX "payload_locked_documents_rels_trainings_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "trainings_id";`)
}
