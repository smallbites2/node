-- SQLBook: Code
CREATE TABLE "email_verification_tokens" (
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp DEFAULT now() + interval '1 hour' NOT NULL,
	CONSTRAINT "email_verification_tokens_user_id_token_pk" PRIMARY KEY("user_id","token")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;