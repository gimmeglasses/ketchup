import {
  foreignKey,
  index,
  integer,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers, authenticatedRole } from "drizzle-orm/supabase";
import { sql } from "drizzle-orm";

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [authUsers.id],
      name: "profiles_id_fk",
    }).onDelete("cascade"),
    pgPolicy("profiles_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`auth.uid() = ${table.id}`,
    }),
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    profileId: uuid("profile_id").notNull(),
    title: text("title").notNull(),
    estimatedMinutes: integer("estimated_minutes"),
    dueAt: timestamp("due_at", {
      withTimezone: true,
      mode: "string",
    }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "string",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("tasks_profile_id_idx").on(t.profileId),
    foreignKey({
      columns: [t.profileId],
      foreignColumns: [profiles.id],
      name: "tasks_profile_id_fk",
    }).onDelete("cascade"),
    pgPolicy("tasks_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`auth.uid() = ${t.profileId}`,
    }),
    pgPolicy("tasks_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`auth.uid() = ${t.profileId}`,
    }),
    pgPolicy("tasks_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`auth.uid() = ${t.profileId}`,
      withCheck: sql`auth.uid() = ${t.profileId}`,
    }),
    pgPolicy("tasks_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`auth.uid() = ${t.profileId}`,
    }),
  ]
);

export const pomodoroSessions = pgTable(
  "pomodoro_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    taskId: uuid("task_id").notNull(),
    profileId: uuid("profile_id").notNull(),
    startedAt: timestamp("started_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    stoppedAt: timestamp("stopped_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("pomodoro_sessions_task_id_idx").on(t.taskId),
    index("pomodoro_sessions_profile_id_idx").on(t.profileId),
    foreignKey({
      columns: [t.taskId],
      foreignColumns: [tasks.id],
      name: "pomodoro_sessions_task_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [t.profileId],
      foreignColumns: [profiles.id],
      name: "pomodoro_sessions_profile_id_fk",
    }).onDelete("cascade"),
    pgPolicy("pomodoro_sessions_select_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`auth.uid() = ${t.profileId}`,
    }),
    pgPolicy("pomodoro_sessions_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`auth.uid() = ${t.profileId}`,
    }),
    pgPolicy("pomodoro_sessions_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`auth.uid() = ${t.profileId}`,
      withCheck: sql`auth.uid() = ${t.profileId}`,
    }),
  ]
);
