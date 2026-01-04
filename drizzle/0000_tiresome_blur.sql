CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"estimated_minutes" integer,
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "tasks_user_id_idx" ON "tasks" USING btree ("user_id");
--> statement-breakpoint
CREATE POLICY "tasks_select_own" ON "tasks" AS PERMISSIVE FOR
SELECT TO "authenticated" USING (auth.uid() = "tasks"."user_id");
--> statement-breakpoint
CREATE POLICY "tasks_insert_own" ON "tasks" AS PERMISSIVE FOR
INSERT TO "authenticated" WITH CHECK (auth.uid() = "tasks"."user_id");
--> statement-breakpoint
CREATE POLICY "tasks_update_own" ON "tasks" AS PERMISSIVE FOR
UPDATE TO "authenticated" USING (auth.uid() = "tasks"."user_id");
--> statement-breakpoint
CREATE POLICY "tasks_delete_own" ON "tasks" AS PERMISSIVE FOR DELETE TO "authenticated" USING (auth.uid() = "tasks"."user_id");
