import { test as reset } from "@playwright/test";
import { resetDataBase } from "@/app/db/reset";

reset("reset database", async () => {
  await resetDataBase();
});
