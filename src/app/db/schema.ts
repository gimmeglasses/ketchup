import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  uuid,
} from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  estimatedMinutes: integer("estimated_minutes"),
  dueAt: timestamp("due_at"),
  completedAt: timestamp("completed_at"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
