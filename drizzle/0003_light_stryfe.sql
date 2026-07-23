ALTER TABLE "units" ADD COLUMN "city" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "state" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;