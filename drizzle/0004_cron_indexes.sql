-- SQLBook: Code
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
CREATE INDEX "iplimit_cron_idx" ON "ip_rate_limits" USING btree ("at");--> statement-breakpoint
CREATE INDEX "userlimit_cron_idx" ON "user_rate_limits" USING btree ("at");--> statement-breakpoint
CREATE INDEX "tokens_cron_idx" ON "tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "users_cron_idx" ON "users" USING btree ("email_verified","created_at");