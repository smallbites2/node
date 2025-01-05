DROP INDEX "idx_food_translations_fulltext";--> statement-breakpoint
CREATE INDEX "idx_food_translations_fulltext_title" ON "food_translations" USING pgroonga ("title") WITH (tokenizer='TokenNgram("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)');--> statement-breakpoint
CREATE INDEX "idx_food_translations_fulltext_description" ON "food_translations" USING pgroonga ("description") WITH (tokenizer='TokenNgram("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)');--> statement-breakpoint
CREATE INDEX "idx_food_translations_fulltext_instructions" ON "food_translations" USING pgroonga ("instructions_list") WITH (tokenizer='TokenNgram("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)');--> statement-breakpoint
CREATE INDEX "idx_food_translations_fulltext_yields" ON "food_translations" USING pgroonga ("yields") WITH (tokenizer='TokenNgram("unify_alphabet", false, "unify_symbol", false, "unify_digit", false)');
