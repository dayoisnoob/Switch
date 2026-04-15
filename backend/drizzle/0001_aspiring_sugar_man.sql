CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "public"."user_role" DEFAULT 'user' NOT NULL;