ALTER TABLE "workspace_invitations" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ALTER COLUMN "role" SET DEFAULT 'Member'::text;--> statement-breakpoint
ALTER TABLE "workspace_memberships" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workspace_memberships" ALTER COLUMN "role" SET DEFAULT 'Member'::text;--> statement-breakpoint
DROP TYPE "public"."workspace_role";--> statement-breakpoint
CREATE TYPE "public"."workspace_role" AS ENUM('Owner', 'Admin', 'Member');--> statement-breakpoint
ALTER TABLE "workspace_invitations" ALTER COLUMN "role" SET DEFAULT 'Member'::"public"."workspace_role";--> statement-breakpoint
ALTER TABLE "workspace_invitations" ALTER COLUMN "role" SET DATA TYPE "public"."workspace_role" USING "role"::"public"."workspace_role";--> statement-breakpoint
ALTER TABLE "workspace_memberships" ALTER COLUMN "role" SET DEFAULT 'Member'::"public"."workspace_role";--> statement-breakpoint
ALTER TABLE "workspace_memberships" ALTER COLUMN "role" SET DATA TYPE "public"."workspace_role" USING "role"::"public"."workspace_role";