import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Odstranění šablonových pozůstatků Payload website template. DESTRUKTIVNÍ.
 *
 * `up` dropne:
 *  - globaly `header`, `footer`, `sidebar` včetně `*_nav_items`, `*_rels`
 *    a všech `sidebar_blocks_*` tabulek (a jejich enumů);
 *  - hero kolekce `pages`: `pages_hero_links`, `_pages_v_version_hero_links`,
 *    sloupce `hero_type` / `hero_rich_text` / `hero_media_id` na `pages`
 *    a `version_hero_*` na `_pages_v`, enumy `*_hero_*`;
 *  - sloupce `pages_id` / `posts_id` na `pages_rels` a `_pages_v_rels`
 *    (patřily jen odkazům v hero; v době migrace byly všude NULL).
 *
 * `down` vrací jen SCHÉMA, ne data. Po `down` jsou tabulky prázdné a hero
 * má defaultní `lowImpact` bez obsahu. Obsah 5 RawHtml widgetů Sidebaru
 * (ze seed importu z eStránky) se tím nevrátí; zdroj je
 * `scripts/seed/data/codes.json` (5 záznamů s `enabled`), který dřív
 * četl `scripts/seed/import.ts` a po odstranění globalu už je nepoužívá.
 * Před spuštěním `up` v produkci případně zálohovat tabulky `sidebar*`.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sidebar_blocks_match_widget" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sidebar_blocks_standings_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sidebar_blocks_standings_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sidebar_blocks_sponsors_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sidebar_blocks_partner_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sidebar_blocks_partner_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sidebar_blocks_alert_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sidebar_blocks_external_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sidebar_blocks_raw_html" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sidebar" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "sidebar_blocks_match_widget" CASCADE;
  DROP TABLE "sidebar_blocks_standings_table_rows" CASCADE;
  DROP TABLE "sidebar_blocks_standings_table" CASCADE;
  DROP TABLE "sidebar_blocks_sponsors_block" CASCADE;
  DROP TABLE "sidebar_blocks_partner_links_links" CASCADE;
  DROP TABLE "sidebar_blocks_partner_links" CASCADE;
  DROP TABLE "sidebar_blocks_alert_block" CASCADE;
  DROP TABLE "sidebar_blocks_external_embed" CASCADE;
  DROP TABLE "sidebar_blocks_raw_html" CASCADE;
  DROP TABLE "sidebar" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_media_id_media_id_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_pages_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_posts_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_pages_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_posts_fk";
  
  DROP INDEX "pages_hero_hero_media_idx";
  DROP INDEX "pages_rels_pages_id_idx";
  DROP INDEX "pages_rels_posts_id_idx";
  DROP INDEX "_pages_v_version_hero_version_hero_media_idx";
  DROP INDEX "_pages_v_rels_pages_id_idx";
  DROP INDEX "_pages_v_rels_posts_id_idx";
  ALTER TABLE "pages" DROP COLUMN "hero_type";
  ALTER TABLE "pages" DROP COLUMN "hero_rich_text";
  ALTER TABLE "pages" DROP COLUMN "hero_media_id";
  ALTER TABLE "pages_rels" DROP COLUMN "pages_id";
  ALTER TABLE "pages_rels" DROP COLUMN "posts_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_type";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_rich_text";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_media_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "posts_id";
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";
  DROP TYPE "public"."enum_sidebar_blocks_match_widget_mode";
  DROP TYPE "public"."enum_sidebar_blocks_alert_block_style";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_sidebar_blocks_match_widget_mode" AS ENUM('next', 'last', 'played');
  CREATE TYPE "public"."enum_sidebar_blocks_alert_block_style" AS ENUM('warning', 'danger', 'info');
  CREATE TABLE "pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "sidebar_blocks_match_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mode" "enum_sidebar_blocks_match_widget_mode" DEFAULT 'next' NOT NULL,
  	"team_id" integer,
  	"season_id" integer,
  	"limit" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "sidebar_blocks_standings_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rank" numeric,
  	"team" varchar NOT NULL,
  	"gp" numeric,
  	"w" numeric,
  	"otw" numeric,
  	"otl" numeric,
  	"l" numeric,
  	"gf" numeric,
  	"ga" numeric,
  	"pts" numeric
  );
  
  CREATE TABLE "sidebar_blocks_standings_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"season_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "sidebar_blocks_sponsors_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Sponzoři',
  	"block_name" varchar
  );
  
  CREATE TABLE "sidebar_blocks_partner_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"logo_id" integer
  );
  
  CREATE TABLE "sidebar_blocks_partner_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Weby',
  	"block_name" varchar
  );
  
  CREATE TABLE "sidebar_blocks_alert_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"message" jsonb NOT NULL,
  	"style" "enum_sidebar_blocks_alert_block_style" DEFAULT 'warning',
  	"block_name" varchar
  );
  
  CREATE TABLE "sidebar_blocks_external_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"height" numeric DEFAULT 400,
  	"block_name" varchar
  );
  
  CREATE TABLE "sidebar_blocks_raw_html" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"html" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "sidebar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages" ADD COLUMN "hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "pages" ADD COLUMN "hero_rich_text" jsonb;
  ALTER TABLE "pages" ADD COLUMN "hero_media_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_rich_text" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_media_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_match_widget" ADD CONSTRAINT "sidebar_blocks_match_widget_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_match_widget" ADD CONSTRAINT "sidebar_blocks_match_widget_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_match_widget" ADD CONSTRAINT "sidebar_blocks_match_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_standings_table_rows" ADD CONSTRAINT "sidebar_blocks_standings_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebar_blocks_standings_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_standings_table" ADD CONSTRAINT "sidebar_blocks_standings_table_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_standings_table" ADD CONSTRAINT "sidebar_blocks_standings_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_sponsors_block" ADD CONSTRAINT "sidebar_blocks_sponsors_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_partner_links_links" ADD CONSTRAINT "sidebar_blocks_partner_links_links_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_partner_links_links" ADD CONSTRAINT "sidebar_blocks_partner_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebar_blocks_partner_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_partner_links" ADD CONSTRAINT "sidebar_blocks_partner_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_alert_block" ADD CONSTRAINT "sidebar_blocks_alert_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_external_embed" ADD CONSTRAINT "sidebar_blocks_external_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sidebar_blocks_raw_html" ADD CONSTRAINT "sidebar_blocks_raw_html_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sidebar"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
  CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");
  CREATE INDEX "sidebar_blocks_match_widget_order_idx" ON "sidebar_blocks_match_widget" USING btree ("_order");
  CREATE INDEX "sidebar_blocks_match_widget_parent_id_idx" ON "sidebar_blocks_match_widget" USING btree ("_parent_id");
  CREATE INDEX "sidebar_blocks_match_widget_path_idx" ON "sidebar_blocks_match_widget" USING btree ("_path");
  CREATE INDEX "sidebar_blocks_match_widget_team_idx" ON "sidebar_blocks_match_widget" USING btree ("team_id");
  CREATE INDEX "sidebar_blocks_match_widget_season_idx" ON "sidebar_blocks_match_widget" USING btree ("season_id");
  CREATE INDEX "sidebar_blocks_standings_table_rows_order_idx" ON "sidebar_blocks_standings_table_rows" USING btree ("_order");
  CREATE INDEX "sidebar_blocks_standings_table_rows_parent_id_idx" ON "sidebar_blocks_standings_table_rows" USING btree ("_parent_id");
  CREATE INDEX "sidebar_blocks_standings_table_order_idx" ON "sidebar_blocks_standings_table" USING btree ("_order");
  CREATE INDEX "sidebar_blocks_standings_table_parent_id_idx" ON "sidebar_blocks_standings_table" USING btree ("_parent_id");
  CREATE INDEX "sidebar_blocks_standings_table_path_idx" ON "sidebar_blocks_standings_table" USING btree ("_path");
  CREATE INDEX "sidebar_blocks_standings_table_season_idx" ON "sidebar_blocks_standings_table" USING btree ("season_id");
  CREATE INDEX "sidebar_blocks_sponsors_block_order_idx" ON "sidebar_blocks_sponsors_block" USING btree ("_order");
  CREATE INDEX "sidebar_blocks_sponsors_block_parent_id_idx" ON "sidebar_blocks_sponsors_block" USING btree ("_parent_id");
  CREATE INDEX "sidebar_blocks_sponsors_block_path_idx" ON "sidebar_blocks_sponsors_block" USING btree ("_path");
  CREATE INDEX "sidebar_blocks_partner_links_links_order_idx" ON "sidebar_blocks_partner_links_links" USING btree ("_order");
  CREATE INDEX "sidebar_blocks_partner_links_links_parent_id_idx" ON "sidebar_blocks_partner_links_links" USING btree ("_parent_id");
  CREATE INDEX "sidebar_blocks_partner_links_links_logo_idx" ON "sidebar_blocks_partner_links_links" USING btree ("logo_id");
  CREATE INDEX "sidebar_blocks_partner_links_order_idx" ON "sidebar_blocks_partner_links" USING btree ("_order");
  CREATE INDEX "sidebar_blocks_partner_links_parent_id_idx" ON "sidebar_blocks_partner_links" USING btree ("_parent_id");
  CREATE INDEX "sidebar_blocks_partner_links_path_idx" ON "sidebar_blocks_partner_links" USING btree ("_path");
  CREATE INDEX "sidebar_blocks_alert_block_order_idx" ON "sidebar_blocks_alert_block" USING btree ("_order");
  CREATE INDEX "sidebar_blocks_alert_block_parent_id_idx" ON "sidebar_blocks_alert_block" USING btree ("_parent_id");
  CREATE INDEX "sidebar_blocks_alert_block_path_idx" ON "sidebar_blocks_alert_block" USING btree ("_path");
  CREATE INDEX "sidebar_blocks_external_embed_order_idx" ON "sidebar_blocks_external_embed" USING btree ("_order");
  CREATE INDEX "sidebar_blocks_external_embed_parent_id_idx" ON "sidebar_blocks_external_embed" USING btree ("_parent_id");
  CREATE INDEX "sidebar_blocks_external_embed_path_idx" ON "sidebar_blocks_external_embed" USING btree ("_path");
  CREATE INDEX "sidebar_blocks_raw_html_order_idx" ON "sidebar_blocks_raw_html" USING btree ("_order");
  CREATE INDEX "sidebar_blocks_raw_html_parent_id_idx" ON "sidebar_blocks_raw_html" USING btree ("_parent_id");
  CREATE INDEX "sidebar_blocks_raw_html_path_idx" ON "sidebar_blocks_raw_html" USING btree ("_path");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");`)
}
