import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * ログインページのページオブジェクト
 * /auth/login ページの要素と操作をカプセル化します
 */
export class LoginPage extends BasePage {
  // フォーム要素
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  // リンク
  private readonly registerLink: Locator;

  // エラーメッセージ
  private readonly errorMessage: Locator;

  /**
   * @param page - Playwrightのページインスタンス
   */
  constructor(page: Page) {
    super(page);

    // フォーム要素
    this.emailInput = this.page.getByRole("textbox", { name: /メール/ });
    this.passwordInput = this.page.getByLabel(/^パスワード$/);
    this.loginButton = this.page.getByRole("button", {
      name: "ログイン",
      exact: true,
    });

    // リンク
    this.registerLink = this.page
      .getByRole("paragraph")
      .filter({ hasText: "アカウントをお持ちでない方は" })
      .getByRole("link", { name: "登録する" });

    // エラーメッセージ
    this.errorMessage = this.page.locator('[role="alert"], .error-message');
  }

  /**
   * ログインページに遷移します
   */
  async navigate() {
    await this.goto("/auth/login");
  }

  /**
   * メールアドレスを入力します
   * @param email - メールアドレス
   */
  async fillEmail(email: string) {
    await this.fill(this.emailInput, email);
  }

  /**
   * パスワードを入力します
   * @param password - パスワード
   */
  async fillPassword(password: string) {
    await this.fill(this.passwordInput, password);
  }

  /**
   * ログインフォームに入力します
   * @param email - メールアドレス
   * @param password - パスワード
   */
  async fillLoginForm(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  /**
   * ログインボタンをクリックします
   * Next.js の overlay 要素により Playwright が
   * pointer block と判定することがあるため、
   * 遷移確認目的として force:true を使用します。
   */
  async clickLoginButton() {
    // ダッシュボードへのナビゲーションを待機しながらクリック
    await Promise.all([
      this.loginButton.click({ force: true }),
      this.page.waitForURL(/\/dashboard/, { timeout: 15000 }),
    ]);
  }

  /**
   * ログインを実行します
   * @param email - メールアドレス
   * @param password - パスワード
   */
  async login(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.clickLoginButton();
  }

  /**
   * 会員登録ページへのリンクをクリックします
   */
  async clickRegisterLink() {
    await this.registerLink.click();
  }

  /**
   * フォームが表示されていることを検証します
   */
  async verifyFormVisible() {
    await this.waitForVisible(this.emailInput);
    await this.waitForVisible(this.passwordInput);
    await this.waitForVisible(this.loginButton);
  }

  /**
   * ログインボタンが有効であることを検証します
   */
  async verifyLoginButtonEnabled() {
    await this.waitForEnabled(this.loginButton);
  }

  /**
   * エラーメッセージが表示されていることを検証します
   * @param message - 期待するエラーメッセージ（オプション）
   */
  async verifyErrorMessage(message?: string | RegExp) {
    await this.waitForVisible(this.errorMessage);
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  // Getter メソッド
  getEmailInput(): Locator {
    return this.emailInput;
  }

  getPasswordInput(): Locator {
    return this.passwordInput;
  }

  getLoginButton(): Locator {
    return this.loginButton;
  }

  getRegisterLink(): Locator {
    return this.registerLink;
  }
}
