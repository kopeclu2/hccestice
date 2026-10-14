import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_matches_goals_side" AS ENUM('ours', 'opp');
  CREATE TYPE "public"."enum_vchl_sync_runs_warnings_type" AS ENUM('unknown-player', 'unknown-opponent', 'ambiguous-player', 'rescheduled', 'missing-on-ahl', 'stats-mismatch', 'other');
  CREATE TYPE "public"."enum_vchl_sync_runs_trigger" AS ENUM('cron', 'manual', 'dry');
  CREATE TYPE "public"."enum_vchl_sync_runs_status" AS ENUM('ok', 'partial', 'error', 'skipped');
  CREATE TYPE "public"."enum_vchl_sync_notifications_notify_on" AS ENUM('failure', 'new-entity', 'rescheduled', 'result');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'vchlSync' BEFORE 'cleanup-payload-auditor-log';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'vchlSync' BEFORE 'cleanup-payload-auditor-log';
  CREATE TABLE "matches_goals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"side" "enum_matches_goals_side",
  	"strength" varchar,
  	"score_after" varchar,
  	"scorer_id" integer,
  	"scorer_name" varchar,
  	"assist1_id" integer,
  	"assist1_name" varchar,
  	"assist2_id" integer,
  	"assist2_name" varchar
  );
  
  CREATE TABLE "matches_lineup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"player_id" integer,
  	"name" varchar,
  	"number" numeric,
  	"goalie" boolean DEFAULT false,
  	"goals" numeric,
  	"assists" numeric,
  	"pim" numeric
  );
  
  CREATE TABLE "opponents_aliases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "vchl_sync_runs_warnings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_vchl_sync_runs_warnings_type",
  	"message" varchar,
  	"ref" varchar
  );
  
  CREATE TABLE "vchl_sync_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"trigger" "enum_vchl_sync_runs_trigger",
  	"status" "enum_vchl_sync_runs_status",
  	"requests" numeric,
  	"started_at" timestamp(3) with time zone,
  	"finished_at" timestamp(3) with time zone,
  	"changes" jsonb,
  	"error" varchar,
  	"sentry_event_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "vchl_sync_notifications_notify_on" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_vchl_sync_notifications_notify_on",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "vchl_sync_notifications_recipients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "vchl_sync" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"parts_schedule" boolean DEFAULT true,
  	"parts_results" boolean DEFAULT true,
  	"parts_match_detail" boolean DEFAULT true,
  	"parts_standings" boolean DEFAULT true,
  	"parts_draft_posts" boolean DEFAULT false,
  	"timing_idle_interval_hours" numeric DEFAULT 6,
  	"timing_matchday_interval_minutes" numeric DEFAULT 15,
  	"timing_matchday_window_hours" numeric DEFAULT 48,
  	"notifications_failure_threshold" numeric DEFAULT 2,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "seasons_standings_rows" ADD COLUMN "wins" numeric;
  ALTER TABLE "seasons_standings_rows" ADD COLUMN "ot_wins" numeric;
  ALTER TABLE "seasons_standings_rows" ADD COLUMN "ot_losses" numeric;
  ALTER TABLE "seasons_standings_rows" ADD COLUMN "losses" numeric;
  ALTER TABLE "seasons_standings_rows" ADD COLUMN "goals_for" numeric;
  ALTER TABLE "seasons_standings_rows" ADD COLUMN "goals_against" numeric;
  ALTER TABLE "seasons" ADD COLUMN "ahl_competition_year_id" numeric;
  ALTER TABLE "seasons" ADD COLUMN "ahl_participant_id" numeric;
  ALTER TABLE "seasons" ADD COLUMN "standings_synced_at" timestamp(3) with time zone;
  ALTER TABLE "players" ADD COLUMN "ahl_player_id" numeric;
  ALTER TABLE "matches" ADD COLUMN "ahl_match_id" numeric;
  ALTER TABLE "matches" ADD COLUMN "ahl_has_report" boolean;
  ALTER TABLE "matches" ADD COLUMN "ahl_synced_at" timestamp(3) with time zone;
  ALTER TABLE "matches" ADD COLUMN "ahl_draft_post_created" boolean;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vchl_sync_runs_id" integer;
  ALTER TABLE "matches_goals" ADD CONSTRAINT "matches_goals_scorer_id_players_id_fk" FOREIGN KEY ("scorer_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_goals" ADD CONSTRAINT "matches_goals_assist1_id_players_id_fk" FOREIGN KEY ("assist1_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_goals" ADD CONSTRAINT "matches_goals_assist2_id_players_id_fk" FOREIGN KEY ("assist2_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_goals" ADD CONSTRAINT "matches_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "matches_lineup" ADD CONSTRAINT "matches_lineup_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_lineup" ADD CONSTRAINT "matches_lineup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "opponents_aliases" ADD CONSTRAINT "opponents_aliases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."opponents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vchl_sync_runs_warnings" ADD CONSTRAINT "vchl_sync_runs_warnings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vchl_sync_runs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vchl_sync_notifications_notify_on" ADD CONSTRAINT "vchl_sync_notifications_notify_on_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vchl_sync"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vchl_sync_notifications_recipients" ADD CONSTRAINT "vchl_sync_notifications_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vchl_sync"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "matches_goals_order_idx" ON "matches_goals" USING btree ("_order");
  CREATE INDEX "matches_goals_parent_id_idx" ON "matches_goals" USING btree ("_parent_id");
  CREATE INDEX "matches_goals_scorer_idx" ON "matches_goals" USING btree ("scorer_id");
  CREATE INDEX "matches_goals_assist1_idx" ON "matches_goals" USING btree ("assist1_id");
  CREATE INDEX "matches_goals_assist2_idx" ON "matches_goals" USING btree ("assist2_id");
  CREATE INDEX "matches_lineup_order_idx" ON "matches_lineup" USING btree ("_order");
  CREATE INDEX "matches_lineup_parent_id_idx" ON "matches_lineup" USING btree ("_parent_id");
  CREATE INDEX "matches_lineup_player_idx" ON "matches_lineup" USING btree ("player_id");
  CREATE INDEX "opponents_aliases_order_idx" ON "opponents_aliases" USING btree ("_order");
  CREATE INDEX "opponents_aliases_parent_id_idx" ON "opponents_aliases" USING btree ("_parent_id");
  CREATE INDEX "vchl_sync_runs_warnings_order_idx" ON "vchl_sync_runs_warnings" USING btree ("_order");
  CREATE INDEX "vchl_sync_runs_warnings_parent_id_idx" ON "vchl_sync_runs_warnings" USING btree ("_parent_id");
  CREATE INDEX "vchl_sync_runs_status_idx" ON "vchl_sync_runs" USING btree ("status");
  CREATE INDEX "vchl_sync_runs_started_at_idx" ON "vchl_sync_runs" USING btree ("started_at");
  CREATE INDEX "vchl_sync_runs_updated_at_idx" ON "vchl_sync_runs" USING btree ("updated_at");
  CREATE INDEX "vchl_sync_runs_created_at_idx" ON "vchl_sync_runs" USING btree ("created_at");
  CREATE INDEX "vchl_sync_notifications_notify_on_order_idx" ON "vchl_sync_notifications_notify_on" USING btree ("order");
  CREATE INDEX "vchl_sync_notifications_notify_on_parent_idx" ON "vchl_sync_notifications_notify_on" USING btree ("parent_id");
  CREATE INDEX "vchl_sync_notifications_recipients_order_idx" ON "vchl_sync_notifications_recipients" USING btree ("_order");
  CREATE INDEX "vchl_sync_notifications_recipients_parent_id_idx" ON "vchl_sync_notifications_recipients" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vchl_sync_runs_fk" FOREIGN KEY ("vchl_sync_runs_id") REFERENCES "public"."vchl_sync_runs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "players_ahl_player_id_idx" ON "players" USING btree ("ahl_player_id");
  CREATE UNIQUE INDEX "matches_ahl_ahl_match_id_idx" ON "matches" USING btree ("ahl_match_id");
  CREATE INDEX "payload_locked_documents_rels_vchl_sync_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("vchl_sync_runs_id");`)

  // Datový krok: 1. ročník VČHL (2025/26) má na ahl.cz pevná ID. Autodetekce
  // umí jen aktuální ročník, takže je sezóně doplníme ručně (jen když chybí).
  await db.execute(sql`
   UPDATE "seasons"
  SET "ahl_competition_year_id" = COALESCE("ahl_competition_year_id", 973),
      "ahl_participant_id" = COALESCE("ahl_participant_id", 8650)
  WHERE "slug" = '2025-2026'
    AND ("ahl_competition_year_id" IS NULL OR "ahl_participant_id" IS NULL);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "matches_goals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "matches_lineup" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "opponents_aliases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vchl_sync_runs_warnings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vchl_sync_runs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vchl_sync_notifications_notify_on" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vchl_sync_notifications_recipients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vchl_sync" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "matches_goals" CASCADE;
  DROP TABLE "matches_lineup" CASCADE;
  DROP TABLE "opponents_aliases" CASCADE;
  DROP TABLE "vchl_sync_runs_warnings" CASCADE;
  DROP TABLE "vchl_sync_runs" CASCADE;
  DROP TABLE "vchl_sync_notifications_notify_on" CASCADE;
  DROP TABLE "vchl_sync_notifications_recipients" CASCADE;
  DROP TABLE "vchl_sync" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_vchl_sync_runs_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'cleanup-payload-auditor-log', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'cleanup-payload-auditor-log', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "players_ahl_player_id_idx";
  DROP INDEX "matches_ahl_ahl_match_id_idx";
  DROP INDEX "payload_locked_documents_rels_vchl_sync_runs_id_idx";
  ALTER TABLE "seasons_standings_rows" DROP COLUMN "wins";
  ALTER TABLE "seasons_standings_rows" DROP COLUMN "ot_wins";
  ALTER TABLE "seasons_standings_rows" DROP COLUMN "ot_losses";
  ALTER TABLE "seasons_standings_rows" DROP COLUMN "losses";
  ALTER TABLE "seasons_standings_rows" DROP COLUMN "goals_for";
  ALTER TABLE "seasons_standings_rows" DROP COLUMN "goals_against";
  ALTER TABLE "seasons" DROP COLUMN "ahl_competition_year_id";
  ALTER TABLE "seasons" DROP COLUMN "ahl_participant_id";
  ALTER TABLE "seasons" DROP COLUMN "standings_synced_at";
  ALTER TABLE "players" DROP COLUMN "ahl_player_id";
  ALTER TABLE "matches" DROP COLUMN "ahl_match_id";
  ALTER TABLE "matches" DROP COLUMN "ahl_has_report";
  ALTER TABLE "matches" DROP COLUMN "ahl_synced_at";
  ALTER TABLE "matches" DROP COLUMN "ahl_draft_post_created";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vchl_sync_runs_id";
  DROP TYPE "public"."enum_matches_goals_side";
  DROP TYPE "public"."enum_vchl_sync_runs_warnings_type";
  DROP TYPE "public"."enum_vchl_sync_runs_trigger";
  DROP TYPE "public"."enum_vchl_sync_runs_status";
  DROP TYPE "public"."enum_vchl_sync_notifications_notify_on";`)
}
