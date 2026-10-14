import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "matches_penalties" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"minutes" numeric,
  	"kind" varchar,
  	"reason" varchar,
  	"player_id" integer,
  	"player_name" varchar
  );
  
  ALTER TABLE "matches" ADD COLUMN "ahl_detail_version" numeric;
  ALTER TABLE "matches" ADD COLUMN "stats_penalties_ours" numeric;
  ALTER TABLE "matches" ADD COLUMN "stats_penalties_opp" numeric;
  ALTER TABLE "matches" ADD COLUMN "stats_majors_ours" numeric;
  ALTER TABLE "matches" ADD COLUMN "stats_majors_opp" numeric;
  ALTER TABLE "matches" ADD COLUMN "stats_pp_goals_ours" numeric;
  ALTER TABLE "matches" ADD COLUMN "stats_pp_goals_opp" numeric;
  ALTER TABLE "matches" ADD COLUMN "stats_pp_time_ours" varchar;
  ALTER TABLE "matches" ADD COLUMN "stats_pp_time_opp" varchar;
  ALTER TABLE "matches_penalties" ADD CONSTRAINT "matches_penalties_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_penalties" ADD CONSTRAINT "matches_penalties_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "matches_penalties_order_idx" ON "matches_penalties" USING btree ("_order");
  CREATE INDEX "matches_penalties_parent_id_idx" ON "matches_penalties" USING btree ("_parent_id");
  CREATE INDEX "matches_penalties_player_idx" ON "matches_penalties" USING btree ("player_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "matches_penalties" CASCADE;
  ALTER TABLE "matches" DROP COLUMN "ahl_detail_version";
  ALTER TABLE "matches" DROP COLUMN "stats_penalties_ours";
  ALTER TABLE "matches" DROP COLUMN "stats_penalties_opp";
  ALTER TABLE "matches" DROP COLUMN "stats_majors_ours";
  ALTER TABLE "matches" DROP COLUMN "stats_majors_opp";
  ALTER TABLE "matches" DROP COLUMN "stats_pp_goals_ours";
  ALTER TABLE "matches" DROP COLUMN "stats_pp_goals_opp";
  ALTER TABLE "matches" DROP COLUMN "stats_pp_time_ours";
  ALTER TABLE "matches" DROP COLUMN "stats_pp_time_opp";`)
}
