CREATE TABLE IF NOT EXISTS "review_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"customer_name" varchar(255),
	"customer_phone" varchar(50),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"rating" integer,
	"feedback" text,
	"converted_to_google" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS "invitations" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "team_members" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "teams" CASCADE;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_team_id_teams_id_fk";
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "metadata" jsonb;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "business_name" varchar(255);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_place_id" varchar(255);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "whatsapp_number" varchar(50);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_status" varchar(20);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "message_templates" jsonb;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "automation_settings" jsonb;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "activity_logs" DROP COLUMN IF EXISTS "team_id";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "deleted_at";
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "users" ADD CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "users" ADD CONSTRAINT "users_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;