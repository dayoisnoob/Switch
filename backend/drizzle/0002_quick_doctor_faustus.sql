ALTER TABLE "card_assignees" RENAME TO "task_assignees";--> statement-breakpoint
ALTER TABLE "cards" RENAME TO "tasks";--> statement-breakpoint
ALTER TABLE "task_assignees" DROP CONSTRAINT "card_assignees_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "task_assignees" DROP CONSTRAINT "card_assignees_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "cards_column_id_columns_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "cards_board_id_boards_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "cards_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "card_labels" DROP CONSTRAINT "card_labels_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "activities" DROP CONSTRAINT "activities_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_card_id_tasks_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_column_id_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."columns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_labels" ADD CONSTRAINT "card_labels_card_id_tasks_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_card_id_tasks_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_card_id_tasks_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_card_id_tasks_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;