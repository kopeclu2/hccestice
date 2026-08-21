import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Hero varianta 2 (`landingHeroModern`) a texty ručních dlaždic Fotoalba.
 *
 * Generátor sem přidal i **cizí** změny bloku Aktualit — `DROP COLUMN`
 * `fallback_photo_id` / `highlight_tag` / `highlight_title` (+ jejich
 * constraint a index) a default `count` z 3 na 4. Ta pola někdo odebral
 * z configu po baseline bez migrace, takže je diff dohání až teď.
 *
 * Ručně jsem je **vyňal**: v produkci v nich mohou být data, drop je
 * nevratný a s tímhle úkolem nesouvisí. Zůstanou jako nullable mrtvé
 * kolony; snapshot `.json` už je nezná, takže je příští `migrate:create`
 * znovu nenavrhne. Uklidit je patří do samostatné migrace.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_landing_hero_modern_cta_variant" AS ENUM('lime', 'dark', 'light');
  CREATE TYPE "public"."enum__pages_v_blocks_landing_hero_modern_cta_variant" AS ENUM('lime', 'dark', 'light');
  CREATE TABLE "pages_blocks_landing_hero_modern" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"intro" varchar,
  	"headline_light" varchar,
  	"headline_bold" varchar,
  	"show_cta" boolean DEFAULT true,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum_pages_blocks_landing_hero_modern_cta_variant" DEFAULT 'lime',
  	"show_nav_cta" boolean DEFAULT true,
  	"nav_cta_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_landing_hero_modern" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"intro" varchar,
  	"headline_light" varchar,
  	"headline_bold" varchar,
  	"show_cta" boolean DEFAULT true,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_variant" "enum__pages_v_blocks_landing_hero_modern_cta_variant" DEFAULT 'lime',
  	"show_nav_cta" boolean DEFAULT true,
  	"nav_cta_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_landing_album_mosaic" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_blocks_landing_album_mosaic" ADD COLUMN "chip" varchar;
  ALTER TABLE "pages_blocks_landing_album_mosaic" ADD COLUMN "href" varchar;
  ALTER TABLE "_pages_v_blocks_landing_album_mosaic" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_blocks_landing_album_mosaic" ADD COLUMN "chip" varchar;
  ALTER TABLE "_pages_v_blocks_landing_album_mosaic" ADD COLUMN "href" varchar;
  ALTER TABLE "pages_blocks_landing_hero_modern" ADD CONSTRAINT "pages_blocks_landing_hero_modern_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_landing_hero_modern" ADD CONSTRAINT "pages_blocks_landing_hero_modern_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_hero_modern" ADD CONSTRAINT "_pages_v_blocks_landing_hero_modern_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_landing_hero_modern" ADD CONSTRAINT "_pages_v_blocks_landing_hero_modern_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_landing_hero_modern_order_idx" ON "pages_blocks_landing_hero_modern" USING btree ("_order");
  CREATE INDEX "pages_blocks_landing_hero_modern_parent_id_idx" ON "pages_blocks_landing_hero_modern" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_landing_hero_modern_path_idx" ON "pages_blocks_landing_hero_modern" USING btree ("_path");
  CREATE INDEX "pages_blocks_landing_hero_modern_photo_idx" ON "pages_blocks_landing_hero_modern" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_landing_hero_modern_order_idx" ON "_pages_v_blocks_landing_hero_modern" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_landing_hero_modern_parent_id_idx" ON "_pages_v_blocks_landing_hero_modern" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_landing_hero_modern_path_idx" ON "_pages_v_blocks_landing_hero_modern" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_landing_hero_modern_photo_idx" ON "_pages_v_blocks_landing_hero_modern" USING btree ("photo_id");
`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_landing_hero_modern" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_landing_hero_modern" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_landing_hero_modern" CASCADE;
  DROP TABLE "_pages_v_blocks_landing_hero_modern" CASCADE;
  ALTER TABLE "pages_blocks_landing_album_mosaic" DROP COLUMN "title";
  ALTER TABLE "pages_blocks_landing_album_mosaic" DROP COLUMN "chip";
  ALTER TABLE "pages_blocks_landing_album_mosaic" DROP COLUMN "href";
  ALTER TABLE "_pages_v_blocks_landing_album_mosaic" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_landing_album_mosaic" DROP COLUMN "chip";
  ALTER TABLE "_pages_v_blocks_landing_album_mosaic" DROP COLUMN "href";
  DROP TYPE "public"."enum_pages_blocks_landing_hero_modern_cta_variant";
  DROP TYPE "public"."enum__pages_v_blocks_landing_hero_modern_cta_variant";`)
}
