-- SQLBook: Code
CREATE TABLE "food_comments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "food_comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"food_id" integer,
	"author_id" integer,
	"content" text,
	"created_at" timestamp DEFAULT now(),
	"edited" boolean DEFAULT false,
	"edited_at" timestamp,
	"parent_id" integer
);
--> statement-breakpoint
DROP INDEX "idx_food_fulltext";--> statement-breakpoint
ALTER TABLE "food_comments" ADD CONSTRAINT "food_comments_food_id_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_comments" ADD CONSTRAINT "food_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_comments" ADD CONSTRAINT "food_comments_parent_id_food_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."food_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_food_comments_food_id" ON "food_comments" USING btree ("food_id");--> statement-breakpoint
CREATE INDEX "idx_food_fulltext" ON "food" USING gin ((
          setweight(to_tsvector('english', title), 'A') ||
          setweight(to_tsvector('english', description), 'B') ||
          setweight(to_tsvector('english', yields), 'C')));