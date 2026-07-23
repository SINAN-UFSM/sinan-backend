CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "token_hash_index" ON "refresh_tokens" USING btree ("token_hash");