import type { tasks } from "@/app/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Task = InferSelectModel<typeof tasks>;
