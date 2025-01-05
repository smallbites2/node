TRUNCATE "food" CASCADE;--> statement-breakpoint
CREATE TABLE "food_translations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "food_translations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"food_id" integer NOT NULL,
	"locale" varchar(5) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"ingredients" text[] NOT NULL,
	"instructions_list" text[] NOT NULL,
	"yields" text NOT NULL,
	"translation_author" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "regions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(2) NOT NULL
);
--> statement-breakpoint
DROP INDEX "idx_food_title";--> statement-breakpoint
DROP INDEX "idx_food_fulltext";--> statement-breakpoint
ALTER TABLE "food" ADD COLUMN "region" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "food_translations" ADD CONSTRAINT "food_translations_food_id_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_translations" ADD CONSTRAINT "food_translations_translation_author_users_id_fk" FOREIGN KEY ("translation_author") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_food_translations_id_locale" ON "food_translations" USING btree ("id","locale");--> statement-breakpoint
CREATE INDEX "idx_food_translations_fulltext" ON "food_translations" USING pgroonga ("title",
            "description",
            "ingredients",
            "instructions_list",
            "yields") WITH (tokenizer='TokenNgram("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)');--> statement-breakpoint
CREATE INDEX "idx_regions_code" ON "regions" USING btree ("code");--> statement-breakpoint
ALTER TABLE "food" ADD CONSTRAINT "food_region_regions_id_fk" FOREIGN KEY ("region") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "food" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "food" DROP COLUMN "ingredients";--> statement-breakpoint
ALTER TABLE "food" DROP COLUMN "yields";--> statement-breakpoint
ALTER TABLE "food" DROP COLUMN "instructions_list";
