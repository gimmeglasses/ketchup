import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../page/login-page";

const authFile = "e2e/.auth/user.json";
let loginPage: LoginPage;

setup("authenticate", async ({ page }) => {
  // ユーザー登録用のテストデータを生成
  // const unique = Date.now();
  // const testName = `e2e test User ${unique}`;
  const testEmail = `e2etest@example.com`;
  const testPassword = "password";

  loginPage = new LoginPage(page);
  // Perform authentication steps. Replace these actions with your own.
  await page.goto("http://localhost:3000/auth/login");
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
