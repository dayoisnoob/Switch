ALTER TABLE "projects" ADD COLUMN "slug" varchar(100) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "projects_workspace_id_slug_idx" ON "projects" USING btree ("workspace_id","slug");