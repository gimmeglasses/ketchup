import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";
import { MailpitHelper } from "../helper/mailpit";

/**
 * 会員登録ページのページオブジェクト
 * /auth/register ページの要素と操作をカプセル化します
 */
export class RegisterPage extends BasePage {
  private readonly mailpitHelper: MailpitHelper;

  // フォーム要素
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly registerButton: Locator;

  // リンク
  private readonly loginLink: Locator;

  // エラーメッセージ
  private readonly errorMessage: Locator;

  /**
   * @param page - Playwrightのページインスタンス
   */
  constructor(page: Page) {
    super(page);

    this.mailpitHelper = new MailpitHelper(page);

    // フォーム要素
    this.nameInput = this.page.getByRole("textbox", { name: /名前/ });
    this.emailInput = this.page.getByRole("textbox", { name: /メール/ });
    this.passwordInput = this.page.getByLabel(/^パスワード$/);
    this.registerButton = this.page.getByRole("button", { name: /登録する/ });

    // リンク
    this.loginLink = this.page
      .getByRole("paragraph")
      .filter({ hasText: "すでにアカウントをお持ちの方は" })
      .getByRole("link", { name: "ログイン" });

    // エラーメッセージ
    this.errorMessage = this.page.locator('[role="alert"], .error-message');
  }

  /**
   * 会員登録ページに遷移します
   */
  async navigate() {
    await this.goto("/auth/register");
  }

  /**
   * 名前を入力します
   * @param name - 名前
   */
  async fillName(name: string) {
    await this.fill(this.nameInput, name);
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
   * 会員登録フォームに入力します
   * @param name - 名前
   * @param email - メールアドレス
   * @param password - パスワード
   */
  async fillRegisterForm(name: string, email: string, password: string) {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  /**
   * 登録ボタンをクリックします
   * Next.js の overlay 要素により Playwright が
   * pointer block と判定することがあるため、
   * 遷移確認目的として force:true を使用します。
   */
  async clickRegisterButton() {
    // ナビゲーションを待機しながらクリック
    await Promise.all([
      this.registerButton.click({ force: true }),
      this.page.waitForURL(/\/auth\/register\/success/),
    ]);
  }

  /**
   * 会員登録を実行します
   * @param name - 名前
   * @param email - メールアドレス
   * @param password - パスワード
   */
  async register(name: string, email: string, password: string) {
    await this.fillRegisterForm(name, email, password);
    await this.clickRegisterButton();
  }

  /**
   * ログインページへのリンクをクリックします
   */
  async clickLoginLink() {
    await this.loginLink.click();
  }

  /**
   * フォームが表示されていることを検証します
   */
  async verifyFormVisible() {
    await this.waitForVisible(this.emailInput);
    await this.waitForVisible(this.passwordInput);
    await this.waitForVisible(this.registerButton);
  }

  /**
   * 登録ボタンが有効であることを検証します
   */
  async verifyRegisterButtonEnabled() {
    await this.waitForEnabled(this.registerButton);
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

  /**
   * 登録成功ページに遷移したことを検証します
   */
  async verifyRegistrationSuccess() {
    await this.expectUrlContains("/auth/register/success");
    await expect(
      this.page.getByRole("heading", { name: /仮登録が完了/ })
    ).toBeVisible();
  }

  /**
   * 確認メールが届くまで待機します
   * @param email - 登録したメールアドレス
   */
  async waitForConfirmationEmail(email: string) {
    const message = await this.mailpitHelper.waitForEmail(email, 15000);
    expect(message).not.toBeNull();
    return message!;
  }

  /**
   * 確認メールの内容を検証します
   * @param email - 登録したメールアドレス
   */
  async verifyConfirmationEmail(email: string) {
    const message = await this.waitForConfirmationEmail(email);

    // 件名の検証
    expect(message.Subject).toContain("確認");

    // 送信先の検証
    expect(message.To[0].Address).toBe(email);

    // 本文の検証
    this.mailpitHelper.verifyEmailContent(message, "本登録");

    return message;
  }

  /**
   * 確認メールから確認リンクを取得します
   * @param email - 登録したメールアドレス
   */
  async getConfirmationLink(email: string): Promise<string> {
    const message = await this.waitForConfirmationEmail(email);
    const link = this.mailpitHelper.extractConfirmationLink(message);

    expect(link).not.toBeNull();
    return link!;
  }

  /**
   * Mailpitのすべてのメールを削除します（テスト前のクリーンアップ用）
   */
  async clearAllEmails() {
    await this.mailpitHelper.deleteAllMessages();
  }

  /**
   * MailpitHelperを取得します
   */
  getMailpitHelper(): MailpitHelper {
    return this.mailpitHelper;
  }

  // Getter メソッド
  getNameInput(): Locator {
    return this.nameInput;
  }

  getEmailInput(): Locator {
    return this.emailInput;
  }

  getPasswordInput(): Locator {
    return this.passwordInput;
  }

  getRegisterButton(): Locator {
    return this.registerButton;
  }

  getLoginLink(): Locator {
    return this.loginLink;
  }
}
