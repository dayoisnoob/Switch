CREATE TYPE "public"."status" AS ENUM('BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED');--> statement-breakpoint
ALTER TABLE "columns" RENAME COLUMN "is_completed" TO "mapped_status";--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "status" "status" DEFAULT 'TODO' NOT NULL;