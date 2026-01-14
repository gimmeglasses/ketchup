CREATE TABLE "pomodoro_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"stopped_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pomodoro_sessions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "pomodoro_sessions"
ADD CONSTRAINT "pomodoro_sessions_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "pomodoro_sessions"
ADD CONSTRAINT "pomodoro_sessions_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "pomodoro_sessions_task_id_idx" ON "pomodoro_sessions" USING btree ("task_id");
--> statement-breakpoint
CREATE INDEX "pomodoro_sessions_profile_id_idx" ON "pomodoro_sessions" USING btree ("profile_id");
--> statement-breakpoint
CREATE POLICY "pomodoro_sessions_select_own" ON "pomodoro_sessions" AS PERMISSIVE FOR
SELECT TO "authenticated" USING (auth.uid() = "pomodoro_sessions"."profile_id");
--> statement-breakpoint
CREATE POLICY "pomodoro_sessions_insert_own" ON "pomodoro_sessions" AS PERMISSIVE FOR
INSERT TO "authenticated" WITH CHECK (auth.uid() = "pomodoro_sessions"."profile_id");
--> statement-breakpoint
CREATE POLICY "pomodoro_sessions_update_own" ON "pomodoro_sessions" AS PERMISSIVE FOR
UPDATE TO "authenticated" USING (auth.uid() = "pomodoro_sessions"."profile_id") WITH CHECK (auth.uid() = "pomodoro_sessions"."profile_id");
