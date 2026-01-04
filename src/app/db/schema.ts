import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  uuid,
  pgPolicy,
  foreignKey,
  index,
} from "drizzle-orm/pg-core";
import { authUsers, authenticatedRole } from "drizzle-orm/supabase";
import { sql } from "drizzle-orm";

export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
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
    index("tasks_user_id_idx").on(t.userId),
    foreignKey({
      columns: [t.userId],
      foreignColumns: [authUsers.id],
      name: "tasks_user_id_fk",
    }).onDelete("cascade"),
    pgPolicy("tasks_select_own", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`auth.uid() = ${t.userId}`,
    }),
    pgPolicy("tasks_insert_own", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`auth.uid() = ${t.userId}`,
    }),
    pgPolicy("tasks_update_own", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`auth.uid() = ${t.userId}`,
    }),
    pgPolicy("tasks_delete_own", {
      as: "permissive",
      for: "delete",
      to: authenticatedRole,
      using: sql`auth.uid() = ${t.userId}`,
    }),
  ]
);
