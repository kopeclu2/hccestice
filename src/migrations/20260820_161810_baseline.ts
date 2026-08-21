import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_landing_album_mosaic_span" AS ENUM('big', 'wide', 'tile');
  CREATE TYPE "public"."enum_pages_blocks_text_section_appearance" AS ENUM('plain', 'card');
  CREATE TYPE "public"."enum_pages_blocks_photo_cards_columns" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum_pages_blocks_photo_cards_height" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_cta_banner_tone" AS ENUM('green', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_matches_widget_mode" AS ENUM('results', 'schedule');
  CREATE TYPE "public"."enum_pages_blocks_posts_grid_post_type" AS ENUM('all', 'news', 'report');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_items_icon" AS ENUM('snowflake', 'trophy', 'medal', 'users', 'heart', 'shield', 'calendar', 'clock', 'flame', 'handshake', 'graduation-cap', 'wallet');
  CREATE TYPE "public"."enum_pages_blocks_announcement_tone" AS ENUM('info', 'warning');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_landing_album_mosaic_span" AS ENUM('big', 'wide', 'tile');
  CREATE TYPE "public"."enum__pages_v_blocks_text_section_appearance" AS ENUM('plain', 'card');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_cards_columns" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum__pages_v_blocks_photo_cards_height" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_banner_tone" AS ENUM('green', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_matches_widget_mode" AS ENUM('results', 'schedule');
  CREATE TYPE "public"."enum__pages_v_blocks_posts_grid_post_type" AS ENUM('all', 'news', 'report');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_items_icon" AS ENUM('snowflake', 'trophy', 'medal', 'users', 'heart', 'shield', 'calendar', 'clock', 'flame', 'handshake', 'graduation-cap', 'wallet');
  CREATE TYPE "public"."enum__pages_v_blocks_announcement_tone" AS ENUM('info', 'warning');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_hero_variant" AS ENUM('foto', 'rozdelene', 'typograficke', 'panel', 'zapas');
  CREATE TYPE "public"."enum_posts_content_type" AS ENUM('richText', 'html');
  CREATE TYPE "public"."enum_posts_type" AS ENUM('news', 'report', 'roster', 'schedule', 'standings');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_hero_variant" AS ENUM('foto', 'rozdelene', 'typograficke', 'panel', 'zapas');
  CREATE TYPE "public"."enum__posts_v_version_content_type" AS ENUM('richText', 'html');
  CREATE TYPE "public"."enum__posts_v_version_type" AS ENUM('news', 'report', 'roster', 'schedule', 'standings');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_media_legacy_source" AS ENUM('img_picture', 'file', 'photo', 'ftp');
  CREATE TYPE "public"."enum_teams_category" AS ENUM('men', 'youth', 'prep');
  CREATE TYPE "public"."enum_players_position" AS ENUM('G', 'D', 'F');
  CREATE TYPE "public"."enum_matches_status" AS ENUM('scheduled', 'played', 'canceled');
  CREATE TYPE "public"."enum_galleries_group" AS ENUM('season', 'theme');
  CREATE TYPE "public"."enum_milestones_era" AS ENUM('zacatky', 'zazemi', 'vchl');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
  CREATE TYPE "public"."enum_navigation_containers_settings_allowed_types" AS ENUM('internal', 'external', 'folder');
  CREATE TYPE "public"."enum_navigation_items_type" AS ENUM('external', 'internal', 'folder');
  CREATE TYPE "public"."enum_navigation_items_anchor" AS ENUM('home', 'aktuality', 'sezona', 'treninky', 'klub', 'fotoalbum', 'historie', 'lide', 'sponzori', 'kontakt');
  CREATE TYPE "public"."enum_navigation_items_target" AS ENUM('_self', '_blank');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
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
  
  CREATE TABLE "pages_blocks_landing_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"intro" varchar,
  	"headline_light" varchar,
  	"headline_bold" varchar,
  	"cta_label" varchar,
  	"nav_cta_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pinned_post_id" integer,
  	"count" numeric DEFAULT 3,
  	"fallback_photo_id" integer,
  	"highlight_tag" varchar,
  	"highlight_title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_season_report_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer
  );
  
  CREATE TABLE "pages_blocks_landing_season" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"season_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"accent" boolean
  );
  
  CREATE TABLE "pages_blocks_landing_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"season_id" integer,
  	"season_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_trainings_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" varchar,
  	"time" varchar,
  	"group" varchar,
  	"joint" boolean
  );
  
  CREATE TABLE "pages_blocks_landing_trainings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"headline_highlight" varchar,
  	"headline_rest" varchar,
  	"perex" varchar,
  	"photo_id" integer,
  	"photo_title" varchar,
  	"photo_subtitle" varchar,
  	"event_kicker" varchar,
  	"event_title" varchar,
  	"event_cta_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_club" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"headline_start" varchar,
  	"headline_highlight" varchar,
  	"perex" varchar,
  	"cta_label" varchar,
  	"stadium_photo_id" integer,
  	"stadium_tag" varchar,
  	"stadium_caption" varchar,
  	"youth_photo_id" integer,
  	"youth_tag" varchar,
  	"youth_caption" varchar,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_album_mosaic" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"span" "enum_pages_blocks_landing_album_mosaic_span" DEFAULT 'tile'
  );
  
  CREATE TABLE "pages_blocks_landing_album" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"gallery_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_history_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"accent" boolean
  );
  
  CREATE TABLE "pages_blocks_landing_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"watermark" varchar,
  	"headline_start" varchar,
  	"headline_highlight" varchar,
  	"lead" varchar,
  	"text" varchar,
  	"meta_line" varchar,
  	"cta_label" varchar,
  	"photos_cta_label" varchar,
  	"quote_start" varchar,
  	"quote_highlight" varchar,
  	"quote_end" varchar,
  	"quote_source" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_sponsors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"title_highlight" varchar,
  	"cta_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_contact_pills" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_contact_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_landing_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"perex" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_section_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"title" varchar,
  	"title_highlight" varchar,
  	"perex" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"appearance" "enum_pages_blocks_text_section_appearance" DEFAULT 'plain',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_photo_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"tag" varchar,
  	"badge" varchar,
  	"caption" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_photo_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"columns" "enum_pages_blocks_photo_cards_columns" DEFAULT '2',
  	"height" "enum_pages_blocks_photo_cards_height" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"title" varchar,
  	"text" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"tone" "enum_pages_blocks_cta_banner_tone" DEFAULT 'green',
  	"photo_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_data_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"data" varchar,
  	"first_row_header" boolean DEFAULT true,
  	"numeric_right" boolean DEFAULT true,
  	"highlight" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_matches_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum_pages_blocks_matches_widget_mode" DEFAULT 'results',
  	"season_id" integer,
  	"team_id" integer,
  	"limit" numeric DEFAULT 5,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_next_match_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_posts_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"post_type" "enum_pages_blocks_posts_grid_post_type" DEFAULT 'all',
  	"season_id" integer,
  	"limit" numeric DEFAULT 6,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_galleries_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"season_id" integer,
  	"limit" numeric DEFAULT 6,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_roster_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_standings_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"season_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_products_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"order_info" varchar,
  	"cta_label" varchar DEFAULT 'Objednat e-mailem',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_player_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"player_id" integer,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_players_picker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_match_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"match_id" integer,
  	"kicker" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_matches_picker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_person_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"person_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"gallery_id" integer,
  	"title" varchar,
  	"limit" numeric DEFAULT 8,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_post_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"post_id" integer,
  	"fallback_photo_id" integer,
  	"tag" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_sponsor_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sponsor_id" integer,
  	"kicker" varchar,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_product_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"kicker" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_feature_grid_items_icon" DEFAULT 'snowflake',
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_cards_cards_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"period" varchar,
  	"description" varchar,
  	"highlighted" boolean,
  	"cta_label" varchar,
  	"cta_href" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"perex" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_downloads_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_downloads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_map_embed_pills" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_map_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"embed_url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_announcement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tone" "enum_pages_blocks_announcement_tone" DEFAULT 'info',
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"dismissible" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_external_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"height" numeric DEFAULT 600,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_raw_html" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"html" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"legacy_article_id" numeric,
  	"legacy_url" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"people_id" integer,
  	"players_id" integer,
  	"matches_id" integer
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
  
  CREATE TABLE "_pages_v_blocks_landing_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"intro" varchar,
  	"headline_light" varchar,
  	"headline_bold" varchar,
  	"cta_label" varchar,
  	"nav_cta_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"pinned_post_id" integer,
  	"count" numeric DEFAULT 3,
  	"fallback_photo_id" integer,
  	"highlight_tag" varchar,
  	"highlight_title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_season_report_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_season" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"season_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"accent" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"season_id" integer,
  	"season_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_trainings_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" varchar,
  	"time" varchar,
  	"group" varchar,
  	"joint" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_trainings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"headline_highlight" varchar,
  	"headline_rest" varchar,
  	"perex" varchar,
  	"photo_id" integer,
  	"photo_title" varchar,
  	"photo_subtitle" varchar,
  	"event_kicker" varchar,
  	"event_title" varchar,
  	"event_cta_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_club" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"headline_start" varchar,
  	"headline_highlight" varchar,
  	"perex" varchar,
  	"cta_label" varchar,
  	"stadium_photo_id" integer,
  	"stadium_tag" varchar,
  	"stadium_caption" varchar,
  	"youth_photo_id" integer,
  	"youth_tag" varchar,
  	"youth_caption" varchar,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_album_mosaic" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"span" "enum__pages_v_blocks_landing_album_mosaic_span" DEFAULT 'tile',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_album" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"gallery_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_history_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"accent" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"watermark" varchar,
  	"headline_start" varchar,
  	"headline_highlight" varchar,
  	"lead" varchar,
  	"text" varchar,
  	"meta_line" varchar,
  	"cta_label" varchar,
  	"photos_cta_label" varchar,
  	"quote_start" varchar,
  	"quote_highlight" varchar,
  	"quote_end" varchar,
  	"quote_source" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_sponsors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"title_highlight" varchar,
  	"cta_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_contact_pills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_contact_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"perex" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_section_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"title" varchar,
  	"title_highlight" varchar,
  	"perex" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"appearance" "enum__pages_v_blocks_text_section_appearance" DEFAULT 'plain',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_photo_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"tag" varchar,
  	"badge" varchar,
  	"caption" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_photo_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"columns" "enum__pages_v_blocks_photo_cards_columns" DEFAULT '2',
  	"height" "enum__pages_v_blocks_photo_cards_height" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"title" varchar,
  	"text" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"tone" "enum__pages_v_blocks_cta_banner_tone" DEFAULT 'green',
  	"photo_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_data_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"data" varchar,
  	"first_row_header" boolean DEFAULT true,
  	"numeric_right" boolean DEFAULT true,
  	"highlight" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_matches_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum__pages_v_blocks_matches_widget_mode" DEFAULT 'results',
  	"season_id" integer,
  	"team_id" integer,
  	"limit" numeric DEFAULT 5,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_next_match_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_posts_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"post_type" "enum__pages_v_blocks_posts_grid_post_type" DEFAULT 'all',
  	"season_id" integer,
  	"limit" numeric DEFAULT 6,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_galleries_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"season_id" integer,
  	"limit" numeric DEFAULT 6,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_roster_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_standings_widget" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"season_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_products_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"order_info" varchar,
  	"cta_label" varchar DEFAULT 'Objednat e-mailem',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_player_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"player_id" integer,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_players_picker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_match_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"match_id" integer,
  	"kicker" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_matches_picker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_person_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"person_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"gallery_id" integer,
  	"title" varchar,
  	"limit" numeric DEFAULT 8,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_post_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"post_id" integer,
  	"fallback_photo_id" integer,
  	"tag" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sponsor_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"sponsor_id" integer,
  	"kicker" varchar,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_product_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"kicker" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_feature_grid_items_icon" DEFAULT 'snowflake',
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"role" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_cards_cards_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" varchar,
  	"period" varchar,
  	"description" varchar,
  	"highlighted" boolean,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"perex" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_downloads_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_downloads" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_map_embed_pills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_map_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"embed_url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_announcement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tone" "enum__pages_v_blocks_announcement_tone" DEFAULT 'info',
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"dismissible" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_external_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"height" numeric DEFAULT 600,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_raw_html" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"html" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_legacy_article_id" numeric,
  	"version_legacy_url" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"people_id" integer,
  	"players_id" integer,
  	"matches_id" integer
  );
  
  CREATE TABLE "posts_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_image_id" integer,
  	"excerpt" varchar,
  	"title_highlight" varchar,
  	"photo_caption" varchar,
  	"content" jsonb,
  	"legacy_html" varchar,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"hero_variant" "enum_posts_hero_variant" DEFAULT 'foto',
  	"match_id" integer,
  	"show_related" boolean DEFAULT true,
  	"author_person_id" integer,
  	"content_type" "enum_posts_content_type" DEFAULT 'richText',
  	"type" "enum_posts_type" DEFAULT 'news',
  	"season_id" integer,
  	"team_id" integer,
  	"legacy_article_id" numeric,
  	"legacy_url" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_posts_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar,
  	"role" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_excerpt" varchar,
  	"version_title_highlight" varchar,
  	"version_photo_caption" varchar,
  	"version_content" jsonb,
  	"version_legacy_html" varchar,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_hero_variant" "enum__posts_v_version_hero_variant" DEFAULT 'foto',
  	"version_match_id" integer,
  	"version_show_related" boolean DEFAULT true,
  	"version_author_person_id" integer,
  	"version_content_type" "enum__posts_v_version_content_type" DEFAULT 'richText',
  	"version_type" "enum__posts_v_version_type" DEFAULT 'news',
  	"version_season_id" integer,
  	"version_team_id" integer,
  	"version_legacy_article_id" numeric,
  	"version_legacy_url" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"caption" jsonb,
  	"legacy_source" "enum_media_legacy_source",
  	"legacy_legacy_id" numeric,
  	"legacy_legacy_path" varchar,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar,
  	"last_name" varchar,
  	"name" varchar,
  	"role" varchar,
  	"phone" varchar,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "seasons_standings_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pos" numeric NOT NULL,
  	"team" varchar NOT NULL,
  	"games" numeric,
  	"points" numeric
  );
  
  CREATE TABLE "seasons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"start_year" numeric NOT NULL,
  	"is_current" boolean DEFAULT false,
  	"standings_label" varchar,
  	"standings_full_table_url" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "teams" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"category" "enum_teams_category" DEFAULT 'men' NOT NULL,
  	"order" numeric DEFAULT 0,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "players" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"photo_id" integer,
  	"number" numeric,
  	"position" "enum_players_position",
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "matches_thirds" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ours" numeric NOT NULL,
  	"opp" numeric NOT NULL
  );
  
  CREATE TABLE "matches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_title" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"season_id" integer NOT NULL,
  	"team_id" integer NOT NULL,
  	"competition" varchar,
  	"opponent_id" integer NOT NULL,
  	"home" boolean DEFAULT true,
  	"venue" varchar,
  	"score_ours" numeric,
  	"score_opp" numeric,
  	"status" "enum_matches_status" DEFAULT 'scheduled' NOT NULL,
  	"overtime" boolean DEFAULT false,
  	"shootout" boolean DEFAULT false,
  	"report_id" integer,
  	"gallery_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "opponents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"city" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "galleries_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "galleries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"date" timestamp(3) with time zone,
  	"season_id" integer,
  	"team_id" integer,
  	"group" "enum_galleries_group" DEFAULT 'season',
  	"cover_id" integer,
  	"legacy_dir" numeric,
  	"legacy_path" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sponsors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"url" varchar,
  	"person" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"active" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"note" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_sizes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "products_params" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"photo_id" integer,
  	"price" numeric NOT NULL,
  	"available" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"description" varchar,
  	"order_note" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "milestones" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"era" "enum_milestones_era" DEFAULT 'vchl' NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"photo_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_country" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"message" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_number" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_state" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar,
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"submit_button_label" varchar,
  	"confirmation_type" "enum_forms_confirmation_type" DEFAULT 'message',
  	"confirmation_message" jsonb,
  	"redirect_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"relation_to" varchar,
  	"category_i_d" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  CREATE TABLE "navigation_containers_settings_allowed_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_navigation_containers_settings_allowed_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "navigation_containers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"settings_max_depth" numeric DEFAULT 3,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "navigation_containers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"navigation_items_id" integer
  );
  
  CREATE TABLE "navigation_items_locale_visibility" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"locale" varchar NOT NULL,
  	"visible" boolean DEFAULT true
  );
  
  CREATE TABLE "navigation_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"type" "enum_navigation_items_type" DEFAULT 'internal' NOT NULL,
  	"parent_id" integer,
  	"order" numeric DEFAULT 0,
  	"url" varchar,
  	"anchor" "enum_navigation_items_anchor",
  	"internal_link_custom_path" varchar,
  	"target" "enum_navigation_items_target" DEFAULT '_self',
  	"active" boolean DEFAULT true,
  	"class_name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "navigation_items_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"navigation_items_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_folders_folder_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_payload_folders_folder_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"users_id" integer,
  	"seasons_id" integer,
  	"teams_id" integer,
  	"players_id" integer,
  	"matches_id" integer,
  	"opponents_id" integer,
  	"galleries_id" integer,
  	"sponsors_id" integer,
  	"people_id" integer,
  	"products_id" integer,
  	"milestones_id" integer,
  	"redirects_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"search_id" integer,
  	"navigation_containers_id" integer,
  	"navigation_items_id" integer,
  	"payload_folders_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  
  CREATE TABLE "site_config_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_config_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "site_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title_text" varchar,
  	"logo_id" integer,
  	"default_post_image_id" integer,
  	"contact_email" varchar,
  	"facebook" varchar,
  	"instagram" varchar,
  	"analytics_id" varchar,
  	"nav_cta_label" varchar,
  	"nav_cta_href" varchar,
  	"footer_photo_id" integer,
  	"footer_headline" varchar,
  	"footer_perex" varchar,
  	"footer_league" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
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
  
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_hero" ADD CONSTRAINT "pages_blocks_landing_hero_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_hero" ADD CONSTRAINT "pages_blocks_landing_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_news" ADD CONSTRAINT "pages_blocks_landing_news_pinned_post_id_posts_id_fk" FOREIGN KEY ("pinned_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_news" ADD CONSTRAINT "pages_blocks_landing_news_fallback_photo_id_media_id_fk" FOREIGN KEY ("fallback_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_news" ADD CONSTRAINT "pages_blocks_landing_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_season_report_photos" ADD CONSTRAINT "pages_blocks_landing_season_report_photos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_season_report_photos" ADD CONSTRAINT "pages_blocks_landing_season_report_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_landing_season"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_season" ADD CONSTRAINT "pages_blocks_landing_season_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_season" ADD CONSTRAINT "pages_blocks_landing_season_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_stats_items" ADD CONSTRAINT "pages_blocks_landing_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_landing_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_stats" ADD CONSTRAINT "pages_blocks_landing_stats_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_stats" ADD CONSTRAINT "pages_blocks_landing_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_trainings_rows" ADD CONSTRAINT "pages_blocks_landing_trainings_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_landing_trainings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_trainings" ADD CONSTRAINT "pages_blocks_landing_trainings_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_trainings" ADD CONSTRAINT "pages_blocks_landing_trainings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_club" ADD CONSTRAINT "pages_blocks_landing_club_stadium_photo_id_media_id_fk" FOREIGN KEY ("stadium_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_club" ADD CONSTRAINT "pages_blocks_landing_club_youth_photo_id_media_id_fk" FOREIGN KEY ("youth_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_club" ADD CONSTRAINT "pages_blocks_landing_club_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_album_mosaic" ADD CONSTRAINT "pages_blocks_landing_album_mosaic_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_album_mosaic" ADD CONSTRAINT "pages_blocks_landing_album_mosaic_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_landing_album"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_album" ADD CONSTRAINT "pages_blocks_landing_album_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_album" ADD CONSTRAINT "pages_blocks_landing_album_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_history_chips" ADD CONSTRAINT "pages_blocks_landing_history_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_landing_history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_history" ADD CONSTRAINT "pages_blocks_landing_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_people" ADD CONSTRAINT "pages_blocks_landing_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_sponsors" ADD CONSTRAINT "pages_blocks_landing_sponsors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_faq_items" ADD CONSTRAINT "pages_blocks_landing_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_landing_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_faq" ADD CONSTRAINT "pages_blocks_landing_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_contact_pills" ADD CONSTRAINT "pages_blocks_landing_contact_pills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_landing_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_contact_topics" ADD CONSTRAINT "pages_blocks_landing_contact_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_landing_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_contact" ADD CONSTRAINT "pages_blocks_landing_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_section_heading" ADD CONSTRAINT "pages_blocks_section_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_section" ADD CONSTRAINT "pages_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_cards_cards" ADD CONSTRAINT "pages_blocks_photo_cards_cards_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_cards_cards" ADD CONSTRAINT "pages_blocks_photo_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_photo_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_photo_cards" ADD CONSTRAINT "pages_blocks_photo_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_banner" ADD CONSTRAINT "pages_blocks_cta_banner_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_banner" ADD CONSTRAINT "pages_blocks_cta_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_data_table" ADD CONSTRAINT "pages_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_matches_widget" ADD CONSTRAINT "pages_blocks_matches_widget_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_matches_widget" ADD CONSTRAINT "pages_blocks_matches_widget_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_matches_widget" ADD CONSTRAINT "pages_blocks_matches_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_next_match_widget" ADD CONSTRAINT "pages_blocks_next_match_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_posts_grid" ADD CONSTRAINT "pages_blocks_posts_grid_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_posts_grid" ADD CONSTRAINT "pages_blocks_posts_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_galleries_grid" ADD CONSTRAINT "pages_blocks_galleries_grid_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_galleries_grid" ADD CONSTRAINT "pages_blocks_galleries_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_roster_widget" ADD CONSTRAINT "pages_blocks_roster_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_standings_widget" ADD CONSTRAINT "pages_blocks_standings_widget_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_standings_widget" ADD CONSTRAINT "pages_blocks_standings_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_products_grid" ADD CONSTRAINT "pages_blocks_products_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_player_card" ADD CONSTRAINT "pages_blocks_player_card_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_player_card" ADD CONSTRAINT "pages_blocks_player_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_players_picker" ADD CONSTRAINT "pages_blocks_players_picker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_match_card" ADD CONSTRAINT "pages_blocks_match_card_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_match_card" ADD CONSTRAINT "pages_blocks_match_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_matches_picker" ADD CONSTRAINT "pages_blocks_matches_picker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_person_card" ADD CONSTRAINT "pages_blocks_person_card_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_person_card" ADD CONSTRAINT "pages_blocks_person_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_embed" ADD CONSTRAINT "pages_blocks_gallery_embed_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_embed" ADD CONSTRAINT "pages_blocks_gallery_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_post_feature" ADD CONSTRAINT "pages_blocks_post_feature_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_post_feature" ADD CONSTRAINT "pages_blocks_post_feature_fallback_photo_id_media_id_fk" FOREIGN KEY ("fallback_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_post_feature" ADD CONSTRAINT "pages_blocks_post_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sponsor_card" ADD CONSTRAINT "pages_blocks_sponsor_card_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_sponsor_card" ADD CONSTRAINT "pages_blocks_sponsor_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_card" ADD CONSTRAINT "pages_blocks_product_card_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_card" ADD CONSTRAINT "pages_blocks_product_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_items" ADD CONSTRAINT "pages_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid" ADD CONSTRAINT "pages_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_cards_cards_features" ADD CONSTRAINT "pages_blocks_pricing_cards_cards_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_cards_cards" ADD CONSTRAINT "pages_blocks_pricing_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_cards" ADD CONSTRAINT "pages_blocks_pricing_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_downloads_items" ADD CONSTRAINT "pages_blocks_downloads_items_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_downloads_items" ADD CONSTRAINT "pages_blocks_downloads_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_downloads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_downloads" ADD CONSTRAINT "pages_blocks_downloads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_embed_pills" ADD CONSTRAINT "pages_blocks_map_embed_pills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_map_embed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_embed" ADD CONSTRAINT "pages_blocks_map_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_announcement" ADD CONSTRAINT "pages_blocks_announcement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_external_embed" ADD CONSTRAINT "pages_blocks_external_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_raw_html" ADD CONSTRAINT "pages_blocks_raw_html_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_matches_fk" FOREIGN KEY ("matches_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_hero" ADD CONSTRAINT "_pages_v_blocks_landing_hero_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_hero" ADD CONSTRAINT "_pages_v_blocks_landing_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_news" ADD CONSTRAINT "_pages_v_blocks_landing_news_pinned_post_id_posts_id_fk" FOREIGN KEY ("pinned_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_news" ADD CONSTRAINT "_pages_v_blocks_landing_news_fallback_photo_id_media_id_fk" FOREIGN KEY ("fallback_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_news" ADD CONSTRAINT "_pages_v_blocks_landing_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_season_report_photos" ADD CONSTRAINT "_pages_v_blocks_landing_season_report_photos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_season_report_photos" ADD CONSTRAINT "_pages_v_blocks_landing_season_report_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_landing_season"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_season" ADD CONSTRAINT "_pages_v_blocks_landing_season_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_season" ADD CONSTRAINT "_pages_v_blocks_landing_season_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_stats_items" ADD CONSTRAINT "_pages_v_blocks_landing_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_landing_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_stats" ADD CONSTRAINT "_pages_v_blocks_landing_stats_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_stats" ADD CONSTRAINT "_pages_v_blocks_landing_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_trainings_rows" ADD CONSTRAINT "_pages_v_blocks_landing_trainings_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_landing_trainings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD CONSTRAINT "_pages_v_blocks_landing_trainings_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_trainings" ADD CONSTRAINT "_pages_v_blocks_landing_trainings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_club" ADD CONSTRAINT "_pages_v_blocks_landing_club_stadium_photo_id_media_id_fk" FOREIGN KEY ("stadium_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_club" ADD CONSTRAINT "_pages_v_blocks_landing_club_youth_photo_id_media_id_fk" FOREIGN KEY ("youth_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_club" ADD CONSTRAINT "_pages_v_blocks_landing_club_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_album_mosaic" ADD CONSTRAINT "_pages_v_blocks_landing_album_mosaic_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_album_mosaic" ADD CONSTRAINT "_pages_v_blocks_landing_album_mosaic_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_landing_album"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_album" ADD CONSTRAINT "_pages_v_blocks_landing_album_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_album" ADD CONSTRAINT "_pages_v_blocks_landing_album_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_history_chips" ADD CONSTRAINT "_pages_v_blocks_landing_history_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_landing_history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_history" ADD CONSTRAINT "_pages_v_blocks_landing_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_people" ADD CONSTRAINT "_pages_v_blocks_landing_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_sponsors" ADD CONSTRAINT "_pages_v_blocks_landing_sponsors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_faq_items" ADD CONSTRAINT "_pages_v_blocks_landing_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_landing_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_faq" ADD CONSTRAINT "_pages_v_blocks_landing_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_contact_pills" ADD CONSTRAINT "_pages_v_blocks_landing_contact_pills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_landing_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_contact_topics" ADD CONSTRAINT "_pages_v_blocks_landing_contact_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_landing_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_contact" ADD CONSTRAINT "_pages_v_blocks_landing_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_section_heading" ADD CONSTRAINT "_pages_v_blocks_section_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_section" ADD CONSTRAINT "_pages_v_blocks_text_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_cards_cards" ADD CONSTRAINT "_pages_v_blocks_photo_cards_cards_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_cards_cards" ADD CONSTRAINT "_pages_v_blocks_photo_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_photo_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_photo_cards" ADD CONSTRAINT "_pages_v_blocks_photo_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_banner" ADD CONSTRAINT "_pages_v_blocks_cta_banner_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_banner" ADD CONSTRAINT "_pages_v_blocks_cta_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_data_table" ADD CONSTRAINT "_pages_v_blocks_data_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_matches_widget" ADD CONSTRAINT "_pages_v_blocks_matches_widget_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_matches_widget" ADD CONSTRAINT "_pages_v_blocks_matches_widget_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_matches_widget" ADD CONSTRAINT "_pages_v_blocks_matches_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_next_match_widget" ADD CONSTRAINT "_pages_v_blocks_next_match_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_posts_grid" ADD CONSTRAINT "_pages_v_blocks_posts_grid_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_posts_grid" ADD CONSTRAINT "_pages_v_blocks_posts_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_galleries_grid" ADD CONSTRAINT "_pages_v_blocks_galleries_grid_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_galleries_grid" ADD CONSTRAINT "_pages_v_blocks_galleries_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_roster_widget" ADD CONSTRAINT "_pages_v_blocks_roster_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_standings_widget" ADD CONSTRAINT "_pages_v_blocks_standings_widget_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_standings_widget" ADD CONSTRAINT "_pages_v_blocks_standings_widget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_products_grid" ADD CONSTRAINT "_pages_v_blocks_products_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_player_card" ADD CONSTRAINT "_pages_v_blocks_player_card_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_player_card" ADD CONSTRAINT "_pages_v_blocks_player_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_players_picker" ADD CONSTRAINT "_pages_v_blocks_players_picker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_match_card" ADD CONSTRAINT "_pages_v_blocks_match_card_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_match_card" ADD CONSTRAINT "_pages_v_blocks_match_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_matches_picker" ADD CONSTRAINT "_pages_v_blocks_matches_picker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_person_card" ADD CONSTRAINT "_pages_v_blocks_person_card_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_person_card" ADD CONSTRAINT "_pages_v_blocks_person_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_embed" ADD CONSTRAINT "_pages_v_blocks_gallery_embed_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_embed" ADD CONSTRAINT "_pages_v_blocks_gallery_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_post_feature" ADD CONSTRAINT "_pages_v_blocks_post_feature_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_post_feature" ADD CONSTRAINT "_pages_v_blocks_post_feature_fallback_photo_id_media_id_fk" FOREIGN KEY ("fallback_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_post_feature" ADD CONSTRAINT "_pages_v_blocks_post_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sponsor_card" ADD CONSTRAINT "_pages_v_blocks_sponsor_card_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sponsor_card" ADD CONSTRAINT "_pages_v_blocks_sponsor_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_card" ADD CONSTRAINT "_pages_v_blocks_product_card_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_card" ADD CONSTRAINT "_pages_v_blocks_product_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid_items" ADD CONSTRAINT "_pages_v_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid" ADD CONSTRAINT "_pages_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_cards_cards_features" ADD CONSTRAINT "_pages_v_blocks_pricing_cards_cards_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_cards_cards" ADD CONSTRAINT "_pages_v_blocks_pricing_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_cards" ADD CONSTRAINT "_pages_v_blocks_pricing_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_downloads_items" ADD CONSTRAINT "_pages_v_blocks_downloads_items_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_downloads_items" ADD CONSTRAINT "_pages_v_blocks_downloads_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_downloads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_downloads" ADD CONSTRAINT "_pages_v_blocks_downloads_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map_embed_pills" ADD CONSTRAINT "_pages_v_blocks_map_embed_pills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_map_embed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map_embed" ADD CONSTRAINT "_pages_v_blocks_map_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_announcement" ADD CONSTRAINT "_pages_v_blocks_announcement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_external_embed" ADD CONSTRAINT "_pages_v_blocks_external_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_raw_html" ADD CONSTRAINT "_pages_v_blocks_raw_html_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_matches_fk" FOREIGN KEY ("matches_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_populated_authors" ADD CONSTRAINT "posts_populated_authors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_populated_authors" ADD CONSTRAINT "posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_person_id_people_id_fk" FOREIGN KEY ("author_person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_populated_authors" ADD CONSTRAINT "_posts_v_version_populated_authors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_version_populated_authors" ADD CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_match_id_matches_id_fk" FOREIGN KEY ("version_match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_person_id_people_id_fk" FOREIGN KEY ("version_author_person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_season_id_seasons_id_fk" FOREIGN KEY ("version_season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_team_id_teams_id_fk" FOREIGN KEY ("version_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seasons_standings_rows" ADD CONSTRAINT "seasons_standings_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players" ADD CONSTRAINT "players_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_thirds" ADD CONSTRAINT "matches_thirds_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "matches" ADD CONSTRAINT "matches_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches" ADD CONSTRAINT "matches_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches" ADD CONSTRAINT "matches_opponent_id_opponents_id_fk" FOREIGN KEY ("opponent_id") REFERENCES "public"."opponents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches" ADD CONSTRAINT "matches_report_id_posts_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches" ADD CONSTRAINT "matches_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "opponents" ADD CONSTRAINT "opponents_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries_photos" ADD CONSTRAINT "galleries_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries_photos" ADD CONSTRAINT "galleries_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "galleries" ADD CONSTRAINT "galleries_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries" ADD CONSTRAINT "galleries_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries" ADD CONSTRAINT "galleries_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_sizes" ADD CONSTRAINT "products_sizes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_params" ADD CONSTRAINT "products_params_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "milestones" ADD CONSTRAINT "milestones_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number" ADD CONSTRAINT "forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state" ADD CONSTRAINT "forms_blocks_state_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_categories" ADD CONSTRAINT "search_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_containers_settings_allowed_types" ADD CONSTRAINT "navigation_containers_settings_allowed_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_containers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_containers_rels" ADD CONSTRAINT "navigation_containers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_containers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_containers_rels" ADD CONSTRAINT "navigation_containers_rels_navigation_items_fk" FOREIGN KEY ("navigation_items_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_locale_visibility" ADD CONSTRAINT "navigation_items_locale_visibility_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_navigation_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_items_rels" ADD CONSTRAINT "navigation_items_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_rels" ADD CONSTRAINT "navigation_items_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_rels" ADD CONSTRAINT "navigation_items_rels_navigation_items_fk" FOREIGN KEY ("navigation_items_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders_folder_type" ADD CONSTRAINT "payload_folders_folder_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_seasons_fk" FOREIGN KEY ("seasons_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_matches_fk" FOREIGN KEY ("matches_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_opponents_fk" FOREIGN KEY ("opponents_id") REFERENCES "public"."opponents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_galleries_fk" FOREIGN KEY ("galleries_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sponsors_fk" FOREIGN KEY ("sponsors_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_milestones_fk" FOREIGN KEY ("milestones_id") REFERENCES "public"."milestones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_navigation_containers_fk" FOREIGN KEY ("navigation_containers_id") REFERENCES "public"."navigation_containers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_navigation_items_fk" FOREIGN KEY ("navigation_items_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk" FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_config_footer_columns_links" ADD CONSTRAINT "site_config_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_config_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_config_footer_columns" ADD CONSTRAINT "site_config_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_default_post_image_id_media_id_fk" FOREIGN KEY ("default_post_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_config" ADD CONSTRAINT "site_config_footer_photo_id_media_id_fk" FOREIGN KEY ("footer_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
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
  CREATE INDEX "pages_blocks_landing_hero_order_idx" ON "pages_blocks_landing_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_hero_parent_id_idx" ON "pages_blocks_landing_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_hero_path_idx" ON "pages_blocks_landing_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_hero_photo_idx" ON "pages_blocks_landing_hero" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_landing_news_order_idx" ON "pages_blocks_landing_news" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_news_parent_id_idx" ON "pages_blocks_landing_news" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_news_path_idx" ON "pages_blocks_landing_news" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_news_pinned_post_idx" ON "pages_blocks_landing_news" USING btree ("pinned_post_id");
  CREATE INDEX "pages_blocks_landing_news_fallback_photo_idx" ON "pages_blocks_landing_news" USING btree ("fallback_photo_id");
  CREATE INDEX "pages_blocks_landing_season_report_photos_order_idx" ON "pages_blocks_landing_season_report_photos" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_season_report_photos_parent_id_idx" ON "pages_blocks_landing_season_report_photos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_season_report_photos_photo_idx" ON "pages_blocks_landing_season_report_photos" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_landing_season_order_idx" ON "pages_blocks_landing_season" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_season_parent_id_idx" ON "pages_blocks_landing_season" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_season_path_idx" ON "pages_blocks_landing_season" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_season_season_idx" ON "pages_blocks_landing_season" USING btree ("season_id");
  CREATE INDEX "pages_blocks_landing_stats_items_order_idx" ON "pages_blocks_landing_stats_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_stats_items_parent_id_idx" ON "pages_blocks_landing_stats_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_stats_order_idx" ON "pages_blocks_landing_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_stats_parent_id_idx" ON "pages_blocks_landing_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_stats_path_idx" ON "pages_blocks_landing_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_stats_season_idx" ON "pages_blocks_landing_stats" USING btree ("season_id");
  CREATE INDEX "pages_blocks_landing_trainings_rows_order_idx" ON "pages_blocks_landing_trainings_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_trainings_rows_parent_id_idx" ON "pages_blocks_landing_trainings_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_trainings_order_idx" ON "pages_blocks_landing_trainings" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_trainings_parent_id_idx" ON "pages_blocks_landing_trainings" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_trainings_path_idx" ON "pages_blocks_landing_trainings" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_trainings_photo_idx" ON "pages_blocks_landing_trainings" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_landing_club_order_idx" ON "pages_blocks_landing_club" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_club_parent_id_idx" ON "pages_blocks_landing_club" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_club_path_idx" ON "pages_blocks_landing_club" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_club_stadium_stadium_photo_idx" ON "pages_blocks_landing_club" USING btree ("stadium_photo_id");
  CREATE INDEX "pages_blocks_landing_club_youth_youth_photo_idx" ON "pages_blocks_landing_club" USING btree ("youth_photo_id");
  CREATE INDEX "pages_blocks_landing_album_mosaic_order_idx" ON "pages_blocks_landing_album_mosaic" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_album_mosaic_parent_id_idx" ON "pages_blocks_landing_album_mosaic" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_album_mosaic_photo_idx" ON "pages_blocks_landing_album_mosaic" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_landing_album_order_idx" ON "pages_blocks_landing_album" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_album_parent_id_idx" ON "pages_blocks_landing_album" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_album_path_idx" ON "pages_blocks_landing_album" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_album_gallery_idx" ON "pages_blocks_landing_album" USING btree ("gallery_id");
  CREATE INDEX "pages_blocks_landing_history_chips_order_idx" ON "pages_blocks_landing_history_chips" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_history_chips_parent_id_idx" ON "pages_blocks_landing_history_chips" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_history_order_idx" ON "pages_blocks_landing_history" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_history_parent_id_idx" ON "pages_blocks_landing_history" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_history_path_idx" ON "pages_blocks_landing_history" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_people_order_idx" ON "pages_blocks_landing_people" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_people_parent_id_idx" ON "pages_blocks_landing_people" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_people_path_idx" ON "pages_blocks_landing_people" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_sponsors_order_idx" ON "pages_blocks_landing_sponsors" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_sponsors_parent_id_idx" ON "pages_blocks_landing_sponsors" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_sponsors_path_idx" ON "pages_blocks_landing_sponsors" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_faq_items_order_idx" ON "pages_blocks_landing_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_faq_items_parent_id_idx" ON "pages_blocks_landing_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_faq_order_idx" ON "pages_blocks_landing_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_faq_parent_id_idx" ON "pages_blocks_landing_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_faq_path_idx" ON "pages_blocks_landing_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_contact_pills_order_idx" ON "pages_blocks_landing_contact_pills" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_contact_pills_parent_id_idx" ON "pages_blocks_landing_contact_pills" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_contact_topics_order_idx" ON "pages_blocks_landing_contact_topics" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_contact_topics_parent_id_idx" ON "pages_blocks_landing_contact_topics" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_contact_order_idx" ON "pages_blocks_landing_contact" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_contact_parent_id_idx" ON "pages_blocks_landing_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_contact_path_idx" ON "pages_blocks_landing_contact" USING btree ("_path");
  CREATE INDEX "pages_blocks_section_heading_order_idx" ON "pages_blocks_section_heading" USING btree ("_order");
  CREATE INDEX "pages_blocks_section_heading_parent_id_idx" ON "pages_blocks_section_heading" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_section_heading_path_idx" ON "pages_blocks_section_heading" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_section_order_idx" ON "pages_blocks_text_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_section_parent_id_idx" ON "pages_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_section_path_idx" ON "pages_blocks_text_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_photo_cards_cards_order_idx" ON "pages_blocks_photo_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_photo_cards_cards_parent_id_idx" ON "pages_blocks_photo_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_photo_cards_cards_photo_idx" ON "pages_blocks_photo_cards_cards" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_photo_cards_order_idx" ON "pages_blocks_photo_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_photo_cards_parent_id_idx" ON "pages_blocks_photo_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_photo_cards_path_idx" ON "pages_blocks_photo_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_banner_order_idx" ON "pages_blocks_cta_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_banner_parent_id_idx" ON "pages_blocks_cta_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_banner_path_idx" ON "pages_blocks_cta_banner" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_banner_photo_idx" ON "pages_blocks_cta_banner" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_data_table_order_idx" ON "pages_blocks_data_table" USING btree ("_order");
  CREATE INDEX "pages_blocks_data_table_parent_id_idx" ON "pages_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_data_table_path_idx" ON "pages_blocks_data_table" USING btree ("_path");
  CREATE INDEX "pages_blocks_matches_widget_order_idx" ON "pages_blocks_matches_widget" USING btree ("_order");
  CREATE INDEX "pages_blocks_matches_widget_parent_id_idx" ON "pages_blocks_matches_widget" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_matches_widget_path_idx" ON "pages_blocks_matches_widget" USING btree ("_path");
  CREATE INDEX "pages_blocks_matches_widget_season_idx" ON "pages_blocks_matches_widget" USING btree ("season_id");
  CREATE INDEX "pages_blocks_matches_widget_team_idx" ON "pages_blocks_matches_widget" USING btree ("team_id");
  CREATE INDEX "pages_blocks_next_match_widget_order_idx" ON "pages_blocks_next_match_widget" USING btree ("_order");
  CREATE INDEX "pages_blocks_next_match_widget_parent_id_idx" ON "pages_blocks_next_match_widget" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_next_match_widget_path_idx" ON "pages_blocks_next_match_widget" USING btree ("_path");
  CREATE INDEX "pages_blocks_posts_grid_order_idx" ON "pages_blocks_posts_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_posts_grid_parent_id_idx" ON "pages_blocks_posts_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_posts_grid_path_idx" ON "pages_blocks_posts_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_posts_grid_season_idx" ON "pages_blocks_posts_grid" USING btree ("season_id");
  CREATE INDEX "pages_blocks_galleries_grid_order_idx" ON "pages_blocks_galleries_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_galleries_grid_parent_id_idx" ON "pages_blocks_galleries_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_galleries_grid_path_idx" ON "pages_blocks_galleries_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_galleries_grid_season_idx" ON "pages_blocks_galleries_grid" USING btree ("season_id");
  CREATE INDEX "pages_blocks_roster_widget_order_idx" ON "pages_blocks_roster_widget" USING btree ("_order");
  CREATE INDEX "pages_blocks_roster_widget_parent_id_idx" ON "pages_blocks_roster_widget" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_roster_widget_path_idx" ON "pages_blocks_roster_widget" USING btree ("_path");
  CREATE INDEX "pages_blocks_standings_widget_order_idx" ON "pages_blocks_standings_widget" USING btree ("_order");
  CREATE INDEX "pages_blocks_standings_widget_parent_id_idx" ON "pages_blocks_standings_widget" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_standings_widget_path_idx" ON "pages_blocks_standings_widget" USING btree ("_path");
  CREATE INDEX "pages_blocks_standings_widget_season_idx" ON "pages_blocks_standings_widget" USING btree ("season_id");
  CREATE INDEX "pages_blocks_products_grid_order_idx" ON "pages_blocks_products_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_products_grid_parent_id_idx" ON "pages_blocks_products_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_products_grid_path_idx" ON "pages_blocks_products_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_player_card_order_idx" ON "pages_blocks_player_card" USING btree ("_order");
  CREATE INDEX "pages_blocks_player_card_parent_id_idx" ON "pages_blocks_player_card" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_player_card_path_idx" ON "pages_blocks_player_card" USING btree ("_path");
  CREATE INDEX "pages_blocks_player_card_player_idx" ON "pages_blocks_player_card" USING btree ("player_id");
  CREATE INDEX "pages_blocks_players_picker_order_idx" ON "pages_blocks_players_picker" USING btree ("_order");
  CREATE INDEX "pages_blocks_players_picker_parent_id_idx" ON "pages_blocks_players_picker" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_players_picker_path_idx" ON "pages_blocks_players_picker" USING btree ("_path");
  CREATE INDEX "pages_blocks_match_card_order_idx" ON "pages_blocks_match_card" USING btree ("_order");
  CREATE INDEX "pages_blocks_match_card_parent_id_idx" ON "pages_blocks_match_card" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_match_card_path_idx" ON "pages_blocks_match_card" USING btree ("_path");
  CREATE INDEX "pages_blocks_match_card_match_idx" ON "pages_blocks_match_card" USING btree ("match_id");
  CREATE INDEX "pages_blocks_matches_picker_order_idx" ON "pages_blocks_matches_picker" USING btree ("_order");
  CREATE INDEX "pages_blocks_matches_picker_parent_id_idx" ON "pages_blocks_matches_picker" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_matches_picker_path_idx" ON "pages_blocks_matches_picker" USING btree ("_path");
  CREATE INDEX "pages_blocks_person_card_order_idx" ON "pages_blocks_person_card" USING btree ("_order");
  CREATE INDEX "pages_blocks_person_card_parent_id_idx" ON "pages_blocks_person_card" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_person_card_path_idx" ON "pages_blocks_person_card" USING btree ("_path");
  CREATE INDEX "pages_blocks_person_card_person_idx" ON "pages_blocks_person_card" USING btree ("person_id");
  CREATE INDEX "pages_blocks_gallery_embed_order_idx" ON "pages_blocks_gallery_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_embed_parent_id_idx" ON "pages_blocks_gallery_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_embed_path_idx" ON "pages_blocks_gallery_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_embed_gallery_idx" ON "pages_blocks_gallery_embed" USING btree ("gallery_id");
  CREATE INDEX "pages_blocks_post_feature_order_idx" ON "pages_blocks_post_feature" USING btree ("_order");
  CREATE INDEX "pages_blocks_post_feature_parent_id_idx" ON "pages_blocks_post_feature" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_post_feature_path_idx" ON "pages_blocks_post_feature" USING btree ("_path");
  CREATE INDEX "pages_blocks_post_feature_post_idx" ON "pages_blocks_post_feature" USING btree ("post_id");
  CREATE INDEX "pages_blocks_post_feature_fallback_photo_idx" ON "pages_blocks_post_feature" USING btree ("fallback_photo_id");
  CREATE INDEX "pages_blocks_sponsor_card_order_idx" ON "pages_blocks_sponsor_card" USING btree ("_order");
  CREATE INDEX "pages_blocks_sponsor_card_parent_id_idx" ON "pages_blocks_sponsor_card" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sponsor_card_path_idx" ON "pages_blocks_sponsor_card" USING btree ("_path");
  CREATE INDEX "pages_blocks_sponsor_card_sponsor_idx" ON "pages_blocks_sponsor_card" USING btree ("sponsor_id");
  CREATE INDEX "pages_blocks_product_card_order_idx" ON "pages_blocks_product_card" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_card_parent_id_idx" ON "pages_blocks_product_card" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_card_path_idx" ON "pages_blocks_product_card" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_card_product_idx" ON "pages_blocks_product_card" USING btree ("product_id");
  CREATE INDEX "pages_blocks_feature_grid_items_order_idx" ON "pages_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_items_parent_id_idx" ON "pages_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_order_idx" ON "pages_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_parent_id_idx" ON "pages_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_path_idx" ON "pages_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_items_order_idx" ON "pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_items_parent_id_idx" ON "pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_items_photo_idx" ON "pages_blocks_testimonials_items" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricing_cards_cards_features_order_idx" ON "pages_blocks_pricing_cards_cards_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_cards_cards_features_parent_id_idx" ON "pages_blocks_pricing_cards_cards_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_cards_cards_order_idx" ON "pages_blocks_pricing_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_cards_cards_parent_id_idx" ON "pages_blocks_pricing_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_cards_order_idx" ON "pages_blocks_pricing_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_cards_parent_id_idx" ON "pages_blocks_pricing_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_cards_path_idx" ON "pages_blocks_pricing_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_downloads_items_order_idx" ON "pages_blocks_downloads_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_downloads_items_parent_id_idx" ON "pages_blocks_downloads_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_downloads_items_file_idx" ON "pages_blocks_downloads_items" USING btree ("file_id");
  CREATE INDEX "pages_blocks_downloads_order_idx" ON "pages_blocks_downloads" USING btree ("_order");
  CREATE INDEX "pages_blocks_downloads_parent_id_idx" ON "pages_blocks_downloads" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_downloads_path_idx" ON "pages_blocks_downloads" USING btree ("_path");
  CREATE INDEX "pages_blocks_map_embed_pills_order_idx" ON "pages_blocks_map_embed_pills" USING btree ("_order");
  CREATE INDEX "pages_blocks_map_embed_pills_parent_id_idx" ON "pages_blocks_map_embed_pills" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_map_embed_order_idx" ON "pages_blocks_map_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_map_embed_parent_id_idx" ON "pages_blocks_map_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_map_embed_path_idx" ON "pages_blocks_map_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_announcement_order_idx" ON "pages_blocks_announcement" USING btree ("_order");
  CREATE INDEX "pages_blocks_announcement_parent_id_idx" ON "pages_blocks_announcement" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_announcement_path_idx" ON "pages_blocks_announcement" USING btree ("_path");
  CREATE INDEX "pages_blocks_external_embed_order_idx" ON "pages_blocks_external_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_external_embed_parent_id_idx" ON "pages_blocks_external_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_external_embed_path_idx" ON "pages_blocks_external_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_form_idx" ON "pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "pages_blocks_raw_html_order_idx" ON "pages_blocks_raw_html" USING btree ("_order");
  CREATE INDEX "pages_blocks_raw_html_parent_id_idx" ON "pages_blocks_raw_html" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_raw_html_path_idx" ON "pages_blocks_raw_html" USING btree ("_path");
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "pages_legacy_legacy_article_id_idx" ON "pages" USING btree ("legacy_article_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "pages_rels_people_id_idx" ON "pages_rels" USING btree ("people_id");
  CREATE INDEX "pages_rels_players_id_idx" ON "pages_rels" USING btree ("players_id");
  CREATE INDEX "pages_rels_matches_id_idx" ON "pages_rels" USING btree ("matches_id");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_hero_order_idx" ON "_pages_v_blocks_landing_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_hero_parent_id_idx" ON "_pages_v_blocks_landing_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_hero_path_idx" ON "_pages_v_blocks_landing_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_hero_photo_idx" ON "_pages_v_blocks_landing_hero" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_landing_news_order_idx" ON "_pages_v_blocks_landing_news" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_news_parent_id_idx" ON "_pages_v_blocks_landing_news" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_news_path_idx" ON "_pages_v_blocks_landing_news" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_news_pinned_post_idx" ON "_pages_v_blocks_landing_news" USING btree ("pinned_post_id");
  CREATE INDEX "_pages_v_blocks_landing_news_fallback_photo_idx" ON "_pages_v_blocks_landing_news" USING btree ("fallback_photo_id");
  CREATE INDEX "_pages_v_blocks_landing_season_report_photos_order_idx" ON "_pages_v_blocks_landing_season_report_photos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_season_report_photos_parent_id_idx" ON "_pages_v_blocks_landing_season_report_photos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_season_report_photos_photo_idx" ON "_pages_v_blocks_landing_season_report_photos" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_landing_season_order_idx" ON "_pages_v_blocks_landing_season" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_season_parent_id_idx" ON "_pages_v_blocks_landing_season" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_season_path_idx" ON "_pages_v_blocks_landing_season" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_season_season_idx" ON "_pages_v_blocks_landing_season" USING btree ("season_id");
  CREATE INDEX "_pages_v_blocks_landing_stats_items_order_idx" ON "_pages_v_blocks_landing_stats_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_stats_items_parent_id_idx" ON "_pages_v_blocks_landing_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_stats_order_idx" ON "_pages_v_blocks_landing_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_stats_parent_id_idx" ON "_pages_v_blocks_landing_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_stats_path_idx" ON "_pages_v_blocks_landing_stats" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_stats_season_idx" ON "_pages_v_blocks_landing_stats" USING btree ("season_id");
  CREATE INDEX "_pages_v_blocks_landing_trainings_rows_order_idx" ON "_pages_v_blocks_landing_trainings_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_trainings_rows_parent_id_idx" ON "_pages_v_blocks_landing_trainings_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_trainings_order_idx" ON "_pages_v_blocks_landing_trainings" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_trainings_parent_id_idx" ON "_pages_v_blocks_landing_trainings" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_trainings_path_idx" ON "_pages_v_blocks_landing_trainings" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_trainings_photo_idx" ON "_pages_v_blocks_landing_trainings" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_landing_club_order_idx" ON "_pages_v_blocks_landing_club" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_club_parent_id_idx" ON "_pages_v_blocks_landing_club" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_club_path_idx" ON "_pages_v_blocks_landing_club" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_club_stadium_stadium_photo_idx" ON "_pages_v_blocks_landing_club" USING btree ("stadium_photo_id");
  CREATE INDEX "_pages_v_blocks_landing_club_youth_youth_photo_idx" ON "_pages_v_blocks_landing_club" USING btree ("youth_photo_id");
  CREATE INDEX "_pages_v_blocks_landing_album_mosaic_order_idx" ON "_pages_v_blocks_landing_album_mosaic" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_album_mosaic_parent_id_idx" ON "_pages_v_blocks_landing_album_mosaic" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_album_mosaic_photo_idx" ON "_pages_v_blocks_landing_album_mosaic" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_landing_album_order_idx" ON "_pages_v_blocks_landing_album" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_album_parent_id_idx" ON "_pages_v_blocks_landing_album" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_album_path_idx" ON "_pages_v_blocks_landing_album" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_album_gallery_idx" ON "_pages_v_blocks_landing_album" USING btree ("gallery_id");
  CREATE INDEX "_pages_v_blocks_landing_history_chips_order_idx" ON "_pages_v_blocks_landing_history_chips" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_history_chips_parent_id_idx" ON "_pages_v_blocks_landing_history_chips" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_history_order_idx" ON "_pages_v_blocks_landing_history" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_history_parent_id_idx" ON "_pages_v_blocks_landing_history" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_history_path_idx" ON "_pages_v_blocks_landing_history" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_people_order_idx" ON "_pages_v_blocks_landing_people" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_people_parent_id_idx" ON "_pages_v_blocks_landing_people" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_people_path_idx" ON "_pages_v_blocks_landing_people" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_sponsors_order_idx" ON "_pages_v_blocks_landing_sponsors" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_sponsors_parent_id_idx" ON "_pages_v_blocks_landing_sponsors" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_sponsors_path_idx" ON "_pages_v_blocks_landing_sponsors" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_faq_items_order_idx" ON "_pages_v_blocks_landing_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_faq_items_parent_id_idx" ON "_pages_v_blocks_landing_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_faq_order_idx" ON "_pages_v_blocks_landing_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_faq_parent_id_idx" ON "_pages_v_blocks_landing_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_faq_path_idx" ON "_pages_v_blocks_landing_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_contact_pills_order_idx" ON "_pages_v_blocks_landing_contact_pills" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_contact_pills_parent_id_idx" ON "_pages_v_blocks_landing_contact_pills" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_contact_topics_order_idx" ON "_pages_v_blocks_landing_contact_topics" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_contact_topics_parent_id_idx" ON "_pages_v_blocks_landing_contact_topics" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_contact_order_idx" ON "_pages_v_blocks_landing_contact" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_contact_parent_id_idx" ON "_pages_v_blocks_landing_contact" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_contact_path_idx" ON "_pages_v_blocks_landing_contact" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_section_heading_order_idx" ON "_pages_v_blocks_section_heading" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_section_heading_parent_id_idx" ON "_pages_v_blocks_section_heading" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_section_heading_path_idx" ON "_pages_v_blocks_section_heading" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_text_section_order_idx" ON "_pages_v_blocks_text_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_section_parent_id_idx" ON "_pages_v_blocks_text_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_section_path_idx" ON "_pages_v_blocks_text_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_photo_cards_cards_order_idx" ON "_pages_v_blocks_photo_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_photo_cards_cards_parent_id_idx" ON "_pages_v_blocks_photo_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_photo_cards_cards_photo_idx" ON "_pages_v_blocks_photo_cards_cards" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_photo_cards_order_idx" ON "_pages_v_blocks_photo_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_photo_cards_parent_id_idx" ON "_pages_v_blocks_photo_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_photo_cards_path_idx" ON "_pages_v_blocks_photo_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_banner_order_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_banner_parent_id_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_banner_path_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_banner_photo_idx" ON "_pages_v_blocks_cta_banner" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_data_table_order_idx" ON "_pages_v_blocks_data_table" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_data_table_parent_id_idx" ON "_pages_v_blocks_data_table" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_data_table_path_idx" ON "_pages_v_blocks_data_table" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_matches_widget_order_idx" ON "_pages_v_blocks_matches_widget" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_matches_widget_parent_id_idx" ON "_pages_v_blocks_matches_widget" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_matches_widget_path_idx" ON "_pages_v_blocks_matches_widget" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_matches_widget_season_idx" ON "_pages_v_blocks_matches_widget" USING btree ("season_id");
  CREATE INDEX "_pages_v_blocks_matches_widget_team_idx" ON "_pages_v_blocks_matches_widget" USING btree ("team_id");
  CREATE INDEX "_pages_v_blocks_next_match_widget_order_idx" ON "_pages_v_blocks_next_match_widget" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_next_match_widget_parent_id_idx" ON "_pages_v_blocks_next_match_widget" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_next_match_widget_path_idx" ON "_pages_v_blocks_next_match_widget" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_posts_grid_order_idx" ON "_pages_v_blocks_posts_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_posts_grid_parent_id_idx" ON "_pages_v_blocks_posts_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_posts_grid_path_idx" ON "_pages_v_blocks_posts_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_posts_grid_season_idx" ON "_pages_v_blocks_posts_grid" USING btree ("season_id");
  CREATE INDEX "_pages_v_blocks_galleries_grid_order_idx" ON "_pages_v_blocks_galleries_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_galleries_grid_parent_id_idx" ON "_pages_v_blocks_galleries_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_galleries_grid_path_idx" ON "_pages_v_blocks_galleries_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_galleries_grid_season_idx" ON "_pages_v_blocks_galleries_grid" USING btree ("season_id");
  CREATE INDEX "_pages_v_blocks_roster_widget_order_idx" ON "_pages_v_blocks_roster_widget" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_roster_widget_parent_id_idx" ON "_pages_v_blocks_roster_widget" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_roster_widget_path_idx" ON "_pages_v_blocks_roster_widget" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_standings_widget_order_idx" ON "_pages_v_blocks_standings_widget" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_standings_widget_parent_id_idx" ON "_pages_v_blocks_standings_widget" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_standings_widget_path_idx" ON "_pages_v_blocks_standings_widget" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_standings_widget_season_idx" ON "_pages_v_blocks_standings_widget" USING btree ("season_id");
  CREATE INDEX "_pages_v_blocks_products_grid_order_idx" ON "_pages_v_blocks_products_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_products_grid_parent_id_idx" ON "_pages_v_blocks_products_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_products_grid_path_idx" ON "_pages_v_blocks_products_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_player_card_order_idx" ON "_pages_v_blocks_player_card" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_player_card_parent_id_idx" ON "_pages_v_blocks_player_card" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_player_card_path_idx" ON "_pages_v_blocks_player_card" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_player_card_player_idx" ON "_pages_v_blocks_player_card" USING btree ("player_id");
  CREATE INDEX "_pages_v_blocks_players_picker_order_idx" ON "_pages_v_blocks_players_picker" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_players_picker_parent_id_idx" ON "_pages_v_blocks_players_picker" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_players_picker_path_idx" ON "_pages_v_blocks_players_picker" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_match_card_order_idx" ON "_pages_v_blocks_match_card" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_match_card_parent_id_idx" ON "_pages_v_blocks_match_card" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_match_card_path_idx" ON "_pages_v_blocks_match_card" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_match_card_match_idx" ON "_pages_v_blocks_match_card" USING btree ("match_id");
  CREATE INDEX "_pages_v_blocks_matches_picker_order_idx" ON "_pages_v_blocks_matches_picker" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_matches_picker_parent_id_idx" ON "_pages_v_blocks_matches_picker" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_matches_picker_path_idx" ON "_pages_v_blocks_matches_picker" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_person_card_order_idx" ON "_pages_v_blocks_person_card" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_person_card_parent_id_idx" ON "_pages_v_blocks_person_card" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_person_card_path_idx" ON "_pages_v_blocks_person_card" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_person_card_person_idx" ON "_pages_v_blocks_person_card" USING btree ("person_id");
  CREATE INDEX "_pages_v_blocks_gallery_embed_order_idx" ON "_pages_v_blocks_gallery_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_embed_parent_id_idx" ON "_pages_v_blocks_gallery_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_embed_path_idx" ON "_pages_v_blocks_gallery_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_embed_gallery_idx" ON "_pages_v_blocks_gallery_embed" USING btree ("gallery_id");
  CREATE INDEX "_pages_v_blocks_post_feature_order_idx" ON "_pages_v_blocks_post_feature" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_post_feature_parent_id_idx" ON "_pages_v_blocks_post_feature" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_post_feature_path_idx" ON "_pages_v_blocks_post_feature" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_post_feature_post_idx" ON "_pages_v_blocks_post_feature" USING btree ("post_id");
  CREATE INDEX "_pages_v_blocks_post_feature_fallback_photo_idx" ON "_pages_v_blocks_post_feature" USING btree ("fallback_photo_id");
  CREATE INDEX "_pages_v_blocks_sponsor_card_order_idx" ON "_pages_v_blocks_sponsor_card" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sponsor_card_parent_id_idx" ON "_pages_v_blocks_sponsor_card" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sponsor_card_path_idx" ON "_pages_v_blocks_sponsor_card" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sponsor_card_sponsor_idx" ON "_pages_v_blocks_sponsor_card" USING btree ("sponsor_id");
  CREATE INDEX "_pages_v_blocks_product_card_order_idx" ON "_pages_v_blocks_product_card" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_product_card_parent_id_idx" ON "_pages_v_blocks_product_card" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_product_card_path_idx" ON "_pages_v_blocks_product_card" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_product_card_product_idx" ON "_pages_v_blocks_product_card" USING btree ("product_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_order_idx" ON "_pages_v_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_parent_id_idx" ON "_pages_v_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_order_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_parent_id_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_path_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_items_order_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_items_parent_id_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_items_photo_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricing_cards_cards_features_order_idx" ON "_pages_v_blocks_pricing_cards_cards_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_cards_cards_features_parent_id_idx" ON "_pages_v_blocks_pricing_cards_cards_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_cards_cards_order_idx" ON "_pages_v_blocks_pricing_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_cards_cards_parent_id_idx" ON "_pages_v_blocks_pricing_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_cards_order_idx" ON "_pages_v_blocks_pricing_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_cards_parent_id_idx" ON "_pages_v_blocks_pricing_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_cards_path_idx" ON "_pages_v_blocks_pricing_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_downloads_items_order_idx" ON "_pages_v_blocks_downloads_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_downloads_items_parent_id_idx" ON "_pages_v_blocks_downloads_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_downloads_items_file_idx" ON "_pages_v_blocks_downloads_items" USING btree ("file_id");
  CREATE INDEX "_pages_v_blocks_downloads_order_idx" ON "_pages_v_blocks_downloads" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_downloads_parent_id_idx" ON "_pages_v_blocks_downloads" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_downloads_path_idx" ON "_pages_v_blocks_downloads" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_map_embed_pills_order_idx" ON "_pages_v_blocks_map_embed_pills" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_map_embed_pills_parent_id_idx" ON "_pages_v_blocks_map_embed_pills" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_map_embed_order_idx" ON "_pages_v_blocks_map_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_map_embed_parent_id_idx" ON "_pages_v_blocks_map_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_map_embed_path_idx" ON "_pages_v_blocks_map_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_announcement_order_idx" ON "_pages_v_blocks_announcement" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_announcement_parent_id_idx" ON "_pages_v_blocks_announcement" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_announcement_path_idx" ON "_pages_v_blocks_announcement" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_external_embed_order_idx" ON "_pages_v_blocks_external_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_external_embed_parent_id_idx" ON "_pages_v_blocks_external_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_external_embed_path_idx" ON "_pages_v_blocks_external_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_order_idx" ON "_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_block_parent_id_idx" ON "_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_form_block_path_idx" ON "_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_form_idx" ON "_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_raw_html_order_idx" ON "_pages_v_blocks_raw_html" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_raw_html_parent_id_idx" ON "_pages_v_blocks_raw_html" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_raw_html_path_idx" ON "_pages_v_blocks_raw_html" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_legacy_version_legacy_article_id_idx" ON "_pages_v" USING btree ("version_legacy_article_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_people_id_idx" ON "_pages_v_rels" USING btree ("people_id");
  CREATE INDEX "_pages_v_rels_players_id_idx" ON "_pages_v_rels" USING btree ("players_id");
  CREATE INDEX "_pages_v_rels_matches_id_idx" ON "_pages_v_rels" USING btree ("matches_id");
  CREATE INDEX "posts_populated_authors_order_idx" ON "posts_populated_authors" USING btree ("_order");
  CREATE INDEX "posts_populated_authors_parent_id_idx" ON "posts_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "posts_populated_authors_photo_idx" ON "posts_populated_authors" USING btree ("photo_id");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE INDEX "posts_match_idx" ON "posts" USING btree ("match_id");
  CREATE INDEX "posts_author_person_idx" ON "posts" USING btree ("author_person_id");
  CREATE INDEX "posts_type_idx" ON "posts" USING btree ("type");
  CREATE INDEX "posts_season_idx" ON "posts" USING btree ("season_id");
  CREATE INDEX "posts_team_idx" ON "posts" USING btree ("team_id");
  CREATE INDEX "posts_legacy_legacy_article_id_idx" ON "posts" USING btree ("legacy_article_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_version_populated_authors_order_idx" ON "_posts_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_posts_v_version_populated_authors_parent_id_idx" ON "_posts_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_populated_authors_photo_idx" ON "_posts_v_version_populated_authors" USING btree ("photo_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_match_idx" ON "_posts_v" USING btree ("version_match_id");
  CREATE INDEX "_posts_v_version_version_author_person_idx" ON "_posts_v" USING btree ("version_author_person_id");
  CREATE INDEX "_posts_v_version_version_type_idx" ON "_posts_v" USING btree ("version_type");
  CREATE INDEX "_posts_v_version_version_season_idx" ON "_posts_v" USING btree ("version_season_id");
  CREATE INDEX "_posts_v_version_version_team_idx" ON "_posts_v" USING btree ("version_team_id");
  CREATE INDEX "_posts_v_version_legacy_version_legacy_article_id_idx" ON "_posts_v" USING btree ("version_legacy_article_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "media_legacy_legacy_source_idx" ON "media" USING btree ("legacy_source");
  CREATE INDEX "media_legacy_legacy_legacy_id_idx" ON "media" USING btree ("legacy_legacy_id");
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_photo_idx" ON "users" USING btree ("photo_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "seasons_standings_rows_order_idx" ON "seasons_standings_rows" USING btree ("_order");
  CREATE INDEX "seasons_standings_rows_parent_id_idx" ON "seasons_standings_rows" USING btree ("_parent_id");
  CREATE INDEX "seasons_start_year_idx" ON "seasons" USING btree ("start_year");
  CREATE UNIQUE INDEX "seasons_slug_idx" ON "seasons" USING btree ("slug");
  CREATE INDEX "seasons_updated_at_idx" ON "seasons" USING btree ("updated_at");
  CREATE INDEX "seasons_created_at_idx" ON "seasons" USING btree ("created_at");
  CREATE UNIQUE INDEX "teams_slug_idx" ON "teams" USING btree ("slug");
  CREATE INDEX "teams_updated_at_idx" ON "teams" USING btree ("updated_at");
  CREATE INDEX "teams_created_at_idx" ON "teams" USING btree ("created_at");
  CREATE INDEX "players_photo_idx" ON "players" USING btree ("photo_id");
  CREATE INDEX "players_updated_at_idx" ON "players" USING btree ("updated_at");
  CREATE INDEX "players_created_at_idx" ON "players" USING btree ("created_at");
  CREATE INDEX "matches_thirds_order_idx" ON "matches_thirds" USING btree ("_order");
  CREATE INDEX "matches_thirds_parent_id_idx" ON "matches_thirds" USING btree ("_parent_id");
  CREATE INDEX "matches_date_idx" ON "matches" USING btree ("date");
  CREATE INDEX "matches_season_idx" ON "matches" USING btree ("season_id");
  CREATE INDEX "matches_team_idx" ON "matches" USING btree ("team_id");
  CREATE INDEX "matches_opponent_idx" ON "matches" USING btree ("opponent_id");
  CREATE INDEX "matches_status_idx" ON "matches" USING btree ("status");
  CREATE INDEX "matches_report_idx" ON "matches" USING btree ("report_id");
  CREATE INDEX "matches_gallery_idx" ON "matches" USING btree ("gallery_id");
  CREATE INDEX "matches_updated_at_idx" ON "matches" USING btree ("updated_at");
  CREATE INDEX "matches_created_at_idx" ON "matches" USING btree ("created_at");
  CREATE INDEX "opponents_logo_idx" ON "opponents" USING btree ("logo_id");
  CREATE UNIQUE INDEX "opponents_slug_idx" ON "opponents" USING btree ("slug");
  CREATE INDEX "opponents_updated_at_idx" ON "opponents" USING btree ("updated_at");
  CREATE INDEX "opponents_created_at_idx" ON "opponents" USING btree ("created_at");
  CREATE INDEX "galleries_photos_order_idx" ON "galleries_photos" USING btree ("_order");
  CREATE INDEX "galleries_photos_parent_id_idx" ON "galleries_photos" USING btree ("_parent_id");
  CREATE INDEX "galleries_photos_image_idx" ON "galleries_photos" USING btree ("image_id");
  CREATE INDEX "galleries_date_idx" ON "galleries" USING btree ("date");
  CREATE INDEX "galleries_season_idx" ON "galleries" USING btree ("season_id");
  CREATE INDEX "galleries_team_idx" ON "galleries" USING btree ("team_id");
  CREATE INDEX "galleries_cover_idx" ON "galleries" USING btree ("cover_id");
  CREATE INDEX "galleries_legacy_dir_idx" ON "galleries" USING btree ("legacy_dir");
  CREATE UNIQUE INDEX "galleries_slug_idx" ON "galleries" USING btree ("slug");
  CREATE INDEX "galleries_updated_at_idx" ON "galleries" USING btree ("updated_at");
  CREATE INDEX "galleries_created_at_idx" ON "galleries" USING btree ("created_at");
  CREATE INDEX "sponsors_logo_idx" ON "sponsors" USING btree ("logo_id");
  CREATE INDEX "sponsors_updated_at_idx" ON "sponsors" USING btree ("updated_at");
  CREATE INDEX "sponsors_created_at_idx" ON "sponsors" USING btree ("created_at");
  CREATE INDEX "people_photo_idx" ON "people" USING btree ("photo_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "products_sizes_order_idx" ON "products_sizes" USING btree ("_order");
  CREATE INDEX "products_sizes_parent_id_idx" ON "products_sizes" USING btree ("_parent_id");
  CREATE INDEX "products_params_order_idx" ON "products_params" USING btree ("_order");
  CREATE INDEX "products_params_parent_id_idx" ON "products_params" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
  CREATE INDEX "products_photo_idx" ON "products" USING btree ("photo_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "milestones_photo_idx" ON "milestones" USING btree ("photo_id");
  CREATE INDEX "milestones_updated_at_idx" ON "milestones" USING btree ("updated_at");
  CREATE INDEX "milestones_created_at_idx" ON "milestones" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "forms_blocks_checkbox" USING btree ("_path");
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  CREATE INDEX "forms_blocks_email_order_idx" ON "forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "forms_blocks_email" USING btree ("_path");
  CREATE INDEX "forms_blocks_message_order_idx" ON "forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "forms_blocks_message" USING btree ("_path");
  CREATE INDEX "forms_blocks_number_order_idx" ON "forms_blocks_number" USING btree ("_order");
  CREATE INDEX "forms_blocks_number_parent_id_idx" ON "forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_path_idx" ON "forms_blocks_number" USING btree ("_path");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "forms_blocks_select_options" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "forms_blocks_select" USING btree ("_path");
  CREATE INDEX "forms_blocks_state_order_idx" ON "forms_blocks_state" USING btree ("_order");
  CREATE INDEX "forms_blocks_state_parent_id_idx" ON "forms_blocks_state" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_state_path_idx" ON "forms_blocks_state" USING btree ("_path");
  CREATE INDEX "forms_blocks_text_order_idx" ON "forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "forms_blocks_text" USING btree ("_path");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" USING btree ("_path");
  CREATE INDEX "forms_emails_order_idx" ON "forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "forms_emails" USING btree ("_parent_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "search_categories_order_idx" ON "search_categories" USING btree ("_order");
  CREATE INDEX "search_categories_parent_id_idx" ON "search_categories" USING btree ("_parent_id");
  CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX "search_meta_meta_image_idx" ON "search" USING btree ("meta_image_id");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE INDEX "navigation_containers_settings_allowed_types_order_idx" ON "navigation_containers_settings_allowed_types" USING btree ("order");
  CREATE INDEX "navigation_containers_settings_allowed_types_parent_idx" ON "navigation_containers_settings_allowed_types" USING btree ("parent_id");
  CREATE UNIQUE INDEX "navigation_containers_slug_idx" ON "navigation_containers" USING btree ("slug");
  CREATE INDEX "navigation_containers_updated_at_idx" ON "navigation_containers" USING btree ("updated_at");
  CREATE INDEX "navigation_containers_created_at_idx" ON "navigation_containers" USING btree ("created_at");
  CREATE INDEX "navigation_containers_rels_order_idx" ON "navigation_containers_rels" USING btree ("order");
  CREATE INDEX "navigation_containers_rels_parent_idx" ON "navigation_containers_rels" USING btree ("parent_id");
  CREATE INDEX "navigation_containers_rels_path_idx" ON "navigation_containers_rels" USING btree ("path");
  CREATE INDEX "navigation_containers_rels_navigation_items_id_idx" ON "navigation_containers_rels" USING btree ("navigation_items_id");
  CREATE INDEX "navigation_items_locale_visibility_order_idx" ON "navigation_items_locale_visibility" USING btree ("_order");
  CREATE INDEX "navigation_items_locale_visibility_parent_id_idx" ON "navigation_items_locale_visibility" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_parent_idx" ON "navigation_items" USING btree ("parent_id");
  CREATE INDEX "navigation_items_updated_at_idx" ON "navigation_items" USING btree ("updated_at");
  CREATE INDEX "navigation_items_created_at_idx" ON "navigation_items" USING btree ("created_at");
  CREATE INDEX "navigation_items_rels_order_idx" ON "navigation_items_rels" USING btree ("order");
  CREATE INDEX "navigation_items_rels_parent_idx" ON "navigation_items_rels" USING btree ("parent_id");
  CREATE INDEX "navigation_items_rels_path_idx" ON "navigation_items_rels" USING btree ("path");
  CREATE INDEX "navigation_items_rels_pages_id_idx" ON "navigation_items_rels" USING btree ("pages_id");
  CREATE INDEX "navigation_items_rels_navigation_items_id_idx" ON "navigation_items_rels" USING btree ("navigation_items_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_folders_folder_type_order_idx" ON "payload_folders_folder_type" USING btree ("order");
  CREATE INDEX "payload_folders_folder_type_parent_idx" ON "payload_folders_folder_type" USING btree ("parent_id");
  CREATE INDEX "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
  CREATE INDEX "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
  CREATE INDEX "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
  CREATE INDEX "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_seasons_id_idx" ON "payload_locked_documents_rels" USING btree ("seasons_id");
  CREATE INDEX "payload_locked_documents_rels_teams_id_idx" ON "payload_locked_documents_rels" USING btree ("teams_id");
  CREATE INDEX "payload_locked_documents_rels_players_id_idx" ON "payload_locked_documents_rels" USING btree ("players_id");
  CREATE INDEX "payload_locked_documents_rels_matches_id_idx" ON "payload_locked_documents_rels" USING btree ("matches_id");
  CREATE INDEX "payload_locked_documents_rels_opponents_id_idx" ON "payload_locked_documents_rels" USING btree ("opponents_id");
  CREATE INDEX "payload_locked_documents_rels_galleries_id_idx" ON "payload_locked_documents_rels" USING btree ("galleries_id");
  CREATE INDEX "payload_locked_documents_rels_sponsors_id_idx" ON "payload_locked_documents_rels" USING btree ("sponsors_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_milestones_id_idx" ON "payload_locked_documents_rels" USING btree ("milestones_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_locked_documents_rels_navigation_containers_id_idx" ON "payload_locked_documents_rels" USING btree ("navigation_containers_id");
  CREATE INDEX "payload_locked_documents_rels_navigation_items_id_idx" ON "payload_locked_documents_rels" USING btree ("navigation_items_id");
  CREATE INDEX "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
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
  CREATE INDEX "site_config_footer_columns_links_order_idx" ON "site_config_footer_columns_links" USING btree ("_order");
  CREATE INDEX "site_config_footer_columns_links_parent_id_idx" ON "site_config_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "site_config_footer_columns_order_idx" ON "site_config_footer_columns" USING btree ("_order");
  CREATE INDEX "site_config_footer_columns_parent_id_idx" ON "site_config_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "site_config_logo_idx" ON "site_config" USING btree ("logo_id");
  CREATE INDEX "site_config_default_post_image_idx" ON "site_config" USING btree ("default_post_image_id");
  CREATE INDEX "site_config_footer_footer_photo_idx" ON "site_config" USING btree ("footer_photo_id");
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
  CREATE INDEX "sidebar_blocks_raw_html_path_idx" ON "sidebar_blocks_raw_html" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "pages_blocks_landing_hero" CASCADE;
  DROP TABLE "pages_blocks_landing_news" CASCADE;
  DROP TABLE "pages_blocks_landing_season_report_photos" CASCADE;
  DROP TABLE "pages_blocks_landing_season" CASCADE;
  DROP TABLE "pages_blocks_landing_stats_items" CASCADE;
  DROP TABLE "pages_blocks_landing_stats" CASCADE;
  DROP TABLE "pages_blocks_landing_trainings_rows" CASCADE;
  DROP TABLE "pages_blocks_landing_trainings" CASCADE;
  DROP TABLE "pages_blocks_landing_club" CASCADE;
  DROP TABLE "pages_blocks_landing_album_mosaic" CASCADE;
  DROP TABLE "pages_blocks_landing_album" CASCADE;
  DROP TABLE "pages_blocks_landing_history_chips" CASCADE;
  DROP TABLE "pages_blocks_landing_history" CASCADE;
  DROP TABLE "pages_blocks_landing_people" CASCADE;
  DROP TABLE "pages_blocks_landing_sponsors" CASCADE;
  DROP TABLE "pages_blocks_landing_faq_items" CASCADE;
  DROP TABLE "pages_blocks_landing_faq" CASCADE;
  DROP TABLE "pages_blocks_landing_contact_pills" CASCADE;
  DROP TABLE "pages_blocks_landing_contact_topics" CASCADE;
  DROP TABLE "pages_blocks_landing_contact" CASCADE;
  DROP TABLE "pages_blocks_section_heading" CASCADE;
  DROP TABLE "pages_blocks_text_section" CASCADE;
  DROP TABLE "pages_blocks_photo_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_photo_cards" CASCADE;
  DROP TABLE "pages_blocks_cta_banner" CASCADE;
  DROP TABLE "pages_blocks_data_table" CASCADE;
  DROP TABLE "pages_blocks_matches_widget" CASCADE;
  DROP TABLE "pages_blocks_next_match_widget" CASCADE;
  DROP TABLE "pages_blocks_posts_grid" CASCADE;
  DROP TABLE "pages_blocks_galleries_grid" CASCADE;
  DROP TABLE "pages_blocks_roster_widget" CASCADE;
  DROP TABLE "pages_blocks_standings_widget" CASCADE;
  DROP TABLE "pages_blocks_products_grid" CASCADE;
  DROP TABLE "pages_blocks_player_card" CASCADE;
  DROP TABLE "pages_blocks_players_picker" CASCADE;
  DROP TABLE "pages_blocks_match_card" CASCADE;
  DROP TABLE "pages_blocks_matches_picker" CASCADE;
  DROP TABLE "pages_blocks_person_card" CASCADE;
  DROP TABLE "pages_blocks_gallery_embed" CASCADE;
  DROP TABLE "pages_blocks_post_feature" CASCADE;
  DROP TABLE "pages_blocks_sponsor_card" CASCADE;
  DROP TABLE "pages_blocks_product_card" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_items" CASCADE;
  DROP TABLE "pages_blocks_feature_grid" CASCADE;
  DROP TABLE "pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_pricing_cards_cards_features" CASCADE;
  DROP TABLE "pages_blocks_pricing_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_pricing_cards" CASCADE;
  DROP TABLE "pages_blocks_downloads_items" CASCADE;
  DROP TABLE "pages_blocks_downloads" CASCADE;
  DROP TABLE "pages_blocks_map_embed_pills" CASCADE;
  DROP TABLE "pages_blocks_map_embed" CASCADE;
  DROP TABLE "pages_blocks_announcement" CASCADE;
  DROP TABLE "pages_blocks_external_embed" CASCADE;
  DROP TABLE "pages_blocks_form_block" CASCADE;
  DROP TABLE "pages_blocks_raw_html" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_news" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_season_report_photos" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_season" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_stats_items" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_trainings_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_trainings" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_club" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_album_mosaic" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_album" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_history_chips" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_history" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_people" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_sponsors" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_contact_pills" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_contact_topics" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_contact" CASCADE;
  DROP TABLE "_pages_v_blocks_section_heading" CASCADE;
  DROP TABLE "_pages_v_blocks_text_section" CASCADE;
  DROP TABLE "_pages_v_blocks_photo_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_photo_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_banner" CASCADE;
  DROP TABLE "_pages_v_blocks_data_table" CASCADE;
  DROP TABLE "_pages_v_blocks_matches_widget" CASCADE;
  DROP TABLE "_pages_v_blocks_next_match_widget" CASCADE;
  DROP TABLE "_pages_v_blocks_posts_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_galleries_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_roster_widget" CASCADE;
  DROP TABLE "_pages_v_blocks_standings_widget" CASCADE;
  DROP TABLE "_pages_v_blocks_products_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_player_card" CASCADE;
  DROP TABLE "_pages_v_blocks_players_picker" CASCADE;
  DROP TABLE "_pages_v_blocks_match_card" CASCADE;
  DROP TABLE "_pages_v_blocks_matches_picker" CASCADE;
  DROP TABLE "_pages_v_blocks_person_card" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_post_feature" CASCADE;
  DROP TABLE "_pages_v_blocks_sponsor_card" CASCADE;
  DROP TABLE "_pages_v_blocks_product_card" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_cards_cards_features" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_downloads_items" CASCADE;
  DROP TABLE "_pages_v_blocks_downloads" CASCADE;
  DROP TABLE "_pages_v_blocks_map_embed_pills" CASCADE;
  DROP TABLE "_pages_v_blocks_map_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_announcement" CASCADE;
  DROP TABLE "_pages_v_blocks_external_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "_pages_v_blocks_raw_html" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "posts_populated_authors" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_populated_authors" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "seasons_standings_rows" CASCADE;
  DROP TABLE "seasons" CASCADE;
  DROP TABLE "teams" CASCADE;
  DROP TABLE "players" CASCADE;
  DROP TABLE "matches_thirds" CASCADE;
  DROP TABLE "matches" CASCADE;
  DROP TABLE "opponents" CASCADE;
  DROP TABLE "galleries_photos" CASCADE;
  DROP TABLE "galleries" CASCADE;
  DROP TABLE "sponsors" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "products_sizes" CASCADE;
  DROP TABLE "products_params" CASCADE;
  DROP TABLE "products_gallery" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "milestones" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "forms_blocks_checkbox" CASCADE;
  DROP TABLE "forms_blocks_country" CASCADE;
  DROP TABLE "forms_blocks_email" CASCADE;
  DROP TABLE "forms_blocks_message" CASCADE;
  DROP TABLE "forms_blocks_number" CASCADE;
  DROP TABLE "forms_blocks_select_options" CASCADE;
  DROP TABLE "forms_blocks_select" CASCADE;
  DROP TABLE "forms_blocks_state" CASCADE;
  DROP TABLE "forms_blocks_text" CASCADE;
  DROP TABLE "forms_blocks_textarea" CASCADE;
  DROP TABLE "forms_emails" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "form_submissions_submission_data" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "search_categories" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "navigation_containers_settings_allowed_types" CASCADE;
  DROP TABLE "navigation_containers" CASCADE;
  DROP TABLE "navigation_containers_rels" CASCADE;
  DROP TABLE "navigation_items_locale_visibility" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation_items_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_folders_folder_type" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "site_config_footer_columns_links" CASCADE;
  DROP TABLE "site_config_footer_columns" CASCADE;
  DROP TABLE "site_config" CASCADE;
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
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_landing_album_mosaic_span";
  DROP TYPE "public"."enum_pages_blocks_text_section_appearance";
  DROP TYPE "public"."enum_pages_blocks_photo_cards_columns";
  DROP TYPE "public"."enum_pages_blocks_photo_cards_height";
  DROP TYPE "public"."enum_pages_blocks_cta_banner_tone";
  DROP TYPE "public"."enum_pages_blocks_matches_widget_mode";
  DROP TYPE "public"."enum_pages_blocks_posts_grid_post_type";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_items_icon";
  DROP TYPE "public"."enum_pages_blocks_announcement_tone";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_landing_album_mosaic_span";
  DROP TYPE "public"."enum__pages_v_blocks_text_section_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_photo_cards_columns";
  DROP TYPE "public"."enum__pages_v_blocks_photo_cards_height";
  DROP TYPE "public"."enum__pages_v_blocks_cta_banner_tone";
  DROP TYPE "public"."enum__pages_v_blocks_matches_widget_mode";
  DROP TYPE "public"."enum__pages_v_blocks_posts_grid_post_type";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_announcement_tone";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_hero_variant";
  DROP TYPE "public"."enum_posts_content_type";
  DROP TYPE "public"."enum_posts_type";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_hero_variant";
  DROP TYPE "public"."enum__posts_v_version_content_type";
  DROP TYPE "public"."enum__posts_v_version_type";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_media_legacy_source";
  DROP TYPE "public"."enum_teams_category";
  DROP TYPE "public"."enum_players_position";
  DROP TYPE "public"."enum_matches_status";
  DROP TYPE "public"."enum_galleries_group";
  DROP TYPE "public"."enum_milestones_era";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_forms_confirmation_type";
  DROP TYPE "public"."enum_navigation_containers_settings_allowed_types";
  DROP TYPE "public"."enum_navigation_items_type";
  DROP TYPE "public"."enum_navigation_items_anchor";
  DROP TYPE "public"."enum_navigation_items_target";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_payload_folders_folder_type";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_footer_nav_items_link_type";
  DROP TYPE "public"."enum_sidebar_blocks_match_widget_mode";
  DROP TYPE "public"."enum_sidebar_blocks_alert_block_style";`)
}
