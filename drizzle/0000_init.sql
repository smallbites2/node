-- SQLBook: Code
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "food" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "food_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(128) NOT NULL,
	"category" integer NOT NULL,
	"author" integer NOT NULL,
	"description" text NOT NULL,
	"ingredients" text[] NOT NULL,
	"prep_time" integer NOT NULL,
	"cook_time" integer NOT NULL,
	"yields" varchar(128) NOT NULL,
	"calories" double precision NOT NULL,
	"instructions_list" text[] NOT NULL,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp DEFAULT now() + interval '1 day' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"logged_in_ip" "inet" NOT NULL,
	"last_seen_ip" "inet" NOT NULL,
	CONSTRAINT "tokens_user_id_token_pk" PRIMARY KEY("user_id","token"),
	CONSTRAINT "unique_tokens" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(64) NOT NULL,
	"display_name" varchar(64),
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "food" ADD CONSTRAINT "food_category_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food" ADD CONSTRAINT "food_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_food_title" ON "food" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_food_category" ON "food" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_food_author" ON "food" USING btree ("author");--> statement-breakpoint
CREATE INDEX "idx_food_fulltext" ON "food" USING gin ((
        setweight(to_tsvector('english', title), 'A') ||
        setweight(to_tsvector('english', description), 'B') ||
        setweight(to_tsvector('english', yields), 'C')
      ));--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "user_fulltext_idx" ON "users" USING gin ((to_tsvector('english', coalesce(username, '') || ' ' || coalesce(display_name, ''))));