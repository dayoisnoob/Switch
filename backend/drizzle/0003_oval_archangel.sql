ALTER TABLE "users" ALTER COLUMN "auth_provider" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "provider_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;