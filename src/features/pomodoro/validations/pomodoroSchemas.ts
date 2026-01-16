import { z } from "zod";

export const startPomodoroSchema = z.object({
  taskId: z.uuid("Invalid task ID"),
});

export const stopPomodoroSchema = z.object({
  sessionId: z.uuid("Invalid session ID"),
});
