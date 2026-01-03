CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"estimated_minutes" integer,
	"due_at" timestamp,
	"completed_at" timestamp,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "tasks"
	ADD CONSTRAINT "tasks_user_id_fkey"
	FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id")
	ON DELETE CASCADE;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own"
  ON "tasks"
  AS PERMISSIVE FOR SELECT
  TO "authenticated"
  USING (auth.uid() = "tasks"."user_id");

CREATE POLICY "tasks_insert_own"
  ON "tasks"
  AS PERMISSIVE FOR INSERT
  TO "authenticated"
  WITH CHECK (auth.uid() = "tasks"."user_id");

CREATE POLICY "tasks_update_own"
  ON "tasks"
  AS PERMISSIVE FOR UPDATE
  TO "authenticated"
  USING (auth.uid() = "tasks"."user_id");

CREATE POLICY "tasks_delete_own"
  ON "tasks"
  AS PERMISSIVE FOR DELETE
  TO "authenticated"
  USING (auth.uid() = "tasks"."user_id");
