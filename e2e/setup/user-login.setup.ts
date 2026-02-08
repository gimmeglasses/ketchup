import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../page/login-page";

let loginPage: LoginPage;

setup("authenticate", async ({ page }, testInfo) => {
  // ユーザー登録用のテストデータを生成
  const testEmail = `e2etest@example.com`;
  const testPassword = "password";
  const fileName =
    (testInfo.project.metadata.authFileName as string) || "auth-default.json";
  const authFile = `e2e/.auth/${fileName}`;
  console.log(`filename: ${authFile}`);

  loginPage = new LoginPage(page);
  // Perform authentication steps. Replace these actions with your own.
  await page.goto("/auth/login");
  await loginPage.fillLoginForm(testEmail, testPassword);
  await loginPage.clickLoginButton();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL(/\/dashboard/);
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("今日のタスク")).toBeVisible();

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
