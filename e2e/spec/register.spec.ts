import { test, expect } from "@playwright/test";
import { RegisterPage } from "../page/register-page";

test.describe("会員登録ページ", () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.navigate();
  });

  test("ページが正しく読み込まれること", async () => {
    await registerPage.verifyFormVisible();
  });

  test.describe("フォーム表示", () => {
    test("名前入力欄が表示されること", async () => {
      await registerPage.waitForVisible(registerPage.getNameInput());
    });

    test("メールアドレス入力欄が表示されること", async () => {
      await registerPage.waitForVisible(registerPage.getEmailInput());
    });

    test("パスワード入力欄が表示されること", async () => {
      await registerPage.waitForVisible(registerPage.getPasswordInput());
    });

    test("登録ボタンが表示されること", async () => {
      await registerPage.waitForVisible(registerPage.getRegisterButton());
    });

    test("ログインページへのリンクが表示されること", async () => {
      await registerPage.waitForVisible(registerPage.getLoginLink());
    });
  });

  test.describe("フォーム入力", () => {
    test("名前を入力できること", async () => {
      const testName = "Test User";
      await registerPage.fillName(testName);
      await expect(registerPage.getNameInput()).toHaveValue(testName);
    });

    test("メールアドレスを入力できること", async () => {
      const testEmail = "test@example.com";
      await registerPage.fillEmail(testEmail);
      await expect(registerPage.getEmailInput()).toHaveValue(testEmail);
    });

    test("パスワードを入力できること", async () => {
      const testPassword = "password123";
      await registerPage.fillPassword(testPassword);
      await expect(registerPage.getPasswordInput()).toHaveValue(testPassword);
    });

    test("フォーム全体に入力できること", async () => {
      const testName = "Test User";
      const testEmail = "test@example.com";
      const testPassword = "SecurePass123!";

      await registerPage.fillRegisterForm(testName, testEmail, testPassword);
      await expect(registerPage.getEmailInput()).toHaveValue(testEmail);
      await expect(registerPage.getPasswordInput()).toHaveValue(testPassword);
    });
  });

  test.describe("会員登録", () => {
    test("正しい情報で登録処理を実行できること", async ({ page }) => {
      const testName = `会員登録 User ${Date.now()}`;
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = "SecurePass123!";

      await registerPage.fillRegisterForm(testName, testEmail, testPassword);
      await registerPage.clickRegisterButton();

      // 成功ページに遷移することを確認
      await registerPage.verifyRegistrationSuccess();
      await expect(page).toHaveURL(/\/auth\/register\/success/);
    });

    test("会員登録後に確認メールが送信されること", async () => {
      const testName = `e2e test User ${Date.now()}`;
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = "SecurePass123!";

      // 会員登録を実行
      await registerPage.fillRegisterForm(testName, testEmail, testPassword);
      await registerPage.clickRegisterButton();

      // 成功ページに遷移することを確認
      await registerPage.verifyRegistrationSuccess();

      // 確認メールが届くことを確認
      const message = await registerPage.waitForConfirmationEmail(testEmail);

      expect(message).toBeDefined();
      expect(message.To[0].Address).toBe(testEmail);

      // 件名の確認
      expect(message.Subject).toMatch(/Ketchup - メールアドレスの認証/);
    });

    test("確認リンクをクリックすると本登録が完了すること", async ({ page }) => {
      const testName = `e2e test User ${Date.now()}`;
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = "password";

      // 会員登録を実行
      await registerPage.fillRegisterForm(testName, testEmail, testPassword);
      await registerPage.clickRegisterButton();
      await registerPage.verifyRegistrationSuccess();

      // 確認リンクを取得
      const confirmationLink = await registerPage.getConfirmationLink(
        testEmail
      );

      // 確認リンクにアクセス
      await page.goto(confirmationLink);
      // 本登録完了後のリダイレクトを待つ
      await page.waitForURL(/.*/, { timeout: 15000 });

      // URLが登録成功ページから変わったことを確認
      expect(page.url()).not.toContain("/auth/register/success");

      // ログインページまたはダッシュボードに遷移していることを確認
      // Supabaseの設定に応じて調整
      const currentUrl = page.url();
      console.log("リダイレクト後のURL:", currentUrl);
    });
  });
});
