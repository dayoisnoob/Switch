CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE UNIQUE INDEX "labels_workspace_name_idx" ON "labels" USING btree ("workspace_id","name");