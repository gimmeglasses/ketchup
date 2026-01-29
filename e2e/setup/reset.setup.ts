import { test as setup } from "@playwright/test";
import { resetDataBase } from "@/app/db/reset";

setup("reset database", async () => {
  await resetDataBase();
});
