import { test, expect } from "@playwright/test";
import { TopPage } from "../page/top-page";
import { RegisterPage } from "../page/register-page";
import { LoginPage } from "../page/login-page";

test.describe("アプリケーション統合シナリオ", () => {
  let topPage: TopPage;
  let registerPage: RegisterPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    topPage = new TopPage(page);
    registerPage = new RegisterPage(page);
    loginPage = new LoginPage(page);
  });

  test("会員登録からログインしてダッシュボードに遷移できること", async ({
    page,
  }) => {
    // ユーザー登録用のテストデータを生成
    const unique = Date.now();
    const testName = `e2e test User ${unique}`;
    const testEmail = `test-${unique}@example.com`;
    const testPassword = "password";

    let confirmationLink: string;

    await test.step("トップページから会員登録ページへ遷移", async () => {
      await topPage.navigate();
      await topPage.verifyPageLoaded();
      await Promise.all([
        topPage.clickRegisterButton(),
        page.waitForURL(/\/auth\/register/, { timeout: 10000 }),
      ]);
    });

    await test.step("会員登録フォームに入力して登録", async () => {
      await registerPage.verifyFormVisible();
      await registerPage.fillRegisterForm(testName, testEmail, testPassword);
      await registerPage.clickRegisterButton();
      await registerPage.verifyRegistrationSuccess();
    });

    await test.step("確認メール受信と確認リンク抽出", async () => {
      const confirmationEmail =
        await registerPage.waitForConfirmationEmail(testEmail);
      expect(confirmationEmail).toBeDefined();

      const link = registerPage
        .getMailpitHelper()
        .extractConfirmationLink(confirmationEmail);
      expect(link).not.toBeNull();
      confirmationLink = link!;
    });

    await test.step("確認リンクにアクセスしてリダイレクト待機", async () => {
      const response = await page.goto(confirmationLink);
      expect(response?.status()).toBeLessThan(400);

      await page.waitForURL(
        /\/auth\/(login|confirm|register\/success)|\/(dashboard)/,
        {
          timeout: 15000,
        },
      );
      const afterConfirmUrl = page.url();

      if (afterConfirmUrl.includes("/auth/confirm")) {
        await page.waitForURL(/\/auth\/login|\/(dashboard)/, {
          timeout: 15000,
        });
      }
    });

    await test.step("ログインページからログイン", async () => {
      await expect(page).toHaveURL(/\/auth\/login/);
      await loginPage.fillLoginForm(testEmail, testPassword);
      await loginPage.clickLoginButton();
    });

    await test.step("ダッシュボード表示確認", async () => {
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });
});
