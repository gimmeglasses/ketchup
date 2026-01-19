CREATE INDEX "idx_pomodoro_profile_task_finished" ON "pomodoro_sessions" USING btree ("profile_id", "task_id")
INCLUDE ("started_at", "stopped_at")
WHERE "pomodoro_sessions"."stopped_at" is not null;
