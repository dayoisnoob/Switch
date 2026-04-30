ALTER TABLE "workspaces" ALTER COLUMN "colour" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "colour" SET DEFAULT 'bg-[#8B5CF6]';--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "colour" DROP NOT NULL;