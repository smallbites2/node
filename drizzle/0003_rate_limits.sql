-- SQLBook: Code
CREATE TABLE "ip_rate_limits" (
	"ip" "inet" NOT NULL,
	"action" text NOT NULL,
	"at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ip_rate_limits_ip_action_at_pk" PRIMARY KEY("ip","action","at")
);
--> statement-breakpoint
CREATE TABLE "user_rate_limits" (
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_rate_limits_user_id_action_at_pk" PRIMARY KEY("user_id","action","at")
);
--> statement-breakpoint
ALTER TABLE "user_rate_limits" ADD CONSTRAINT "user_rate_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;