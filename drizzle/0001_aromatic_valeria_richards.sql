CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" text NOT NULL,
	"estimated_minutes" integer,
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_profile_id_idx" ON "tasks" USING btree ("profile_id");--> statement-breakpoint
CREATE POLICY "tasks_select_own" ON "tasks" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid() = "tasks"."profile_id");--> statement-breakpoint
CREATE POLICY "tasks_insert_own" ON "tasks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = "tasks"."profile_id");--> statement-breakpoint
CREATE POLICY "tasks_update_own" ON "tasks" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.uid() = "tasks"."profile_id") WITH CHECK (auth.uid() = "tasks"."profile_id");--> statement-breakpoint
CREATE POLICY "tasks_delete_own" ON "tasks" AS PERMISSIVE FOR DELETE TO "authenticated" USING (auth.uid() = "tasks"."profile_id");