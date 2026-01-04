import {
  foreignKey,
  index,
  integer,
  pgPolicy,
  pgTable,
  serial,
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
      for: "select",
      to: authenticatedRole,
      using: sql`auth.uid() = ${t.userId}`,
    }),
    pgPolicy("tasks_insert_own", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`auth.uid() = ${t.userId}`,
    }),
    pgPolicy("tasks_update_own", {
      for: "update",
      to: authenticatedRole,
      using: sql`auth.uid() = ${t.userId}`,
      withCheck: sql`auth.uid() = ${t.userId}`,
    }),
    pgPolicy("tasks_delete_own", {
      for: "delete",
      to: authenticatedRole,
      using: sql`auth.uid() = ${t.userId}`,
    }),
  ]
);
