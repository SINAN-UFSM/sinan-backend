CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX "unit_name_trgm_index" ON "units" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "unit_city_trgm_index" ON "units" USING gin ("city" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "unit_state_trgm_index" ON "units" USING gin ("state" gin_trgm_ops);