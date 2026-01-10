import { pomodoroSessions } from "@/app/db/schema";

export type PomodoroSession = typeof pomodoroSessions.$inferSelect;

export type NewPomodoroSession = typeof pomodoroSessions.$inferInsert;
