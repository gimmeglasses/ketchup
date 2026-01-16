import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * トップページ（ランディングページ）のページオブジェクト
 * Ketchup Pomodoroのトップページの要素と操作をカプセル化します
 */
export class TopPage extends BasePage {
  // ロゴ
  private readonly logo: Locator;

  // ヒーローセクション
  private readonly heroHeading: Locator;
  private readonly heroDescription: Locator;

  // CTAボタン
  private readonly registerButton: Locator;
  private readonly ctaLoginButton: Locator; // CTAセクションのログインボタン

  // ヘッダーのログインボタン
  private readonly headerLoginButton: Locator;

  // 機能紹介カード
  private readonly pomodoroFeatureCard: Locator;
  private readonly todoFeatureCard: Locator;

  // ヘッダーとフッター
  private readonly header: Locator;
  private readonly footer: Locator;

  /**
   * @param page - Playwrightのページインスタンス
   */
  constructor(page: Page) {
    super(page);

    // ロゴ
    this.logo = this.page.getByAltText("Ketchup Pomodoro Logo");

    // ヒーローセクション
    this.heroHeading = this.page.getByRole("heading", {
      name: /集中もタスク管理も/,
    });
    this.heroDescription = this.page.getByText(
      /ポモドーロタイマーと、Todoリストをひとつの画面に/
    );

    // ヘッダーとフッター
    this.header = this.page.locator("header");
    this.footer = this.page.locator("footer");

    // CTAボタン
    this.registerButton = this.page.getByRole("link", {
      name: "無料で会員登録",
    });

    // ヘッダーのログインボタン（ヘッダー内に限定）
    this.headerLoginButton = this.header.getByRole("link", {
      name: "ログイン",
    });

    // CTAセクションのログインボタン（ヘッダー外）
    this.ctaLoginButton = this.page
      .locator("main")
      .getByRole("link", { name: "ログイン" })
      .nth(1);

    // 機能紹介カード
    this.pomodoroFeatureCard = this.page.getByRole("heading", {
      name: "ポモドーロタイマー",
    });
    this.todoFeatureCard = this.page.getByRole("heading", {
      name: "Todoリスト連動",
    });
  }

  /**
   * トップページに遷移します
   */
  async navigate() {
    await this.goto("/");
  }

  /**
   * ページが正しく読み込まれたことを検証します
   */
  async verifyPageLoaded() {
    await this.waitForVisible(this.logo);
    await this.waitForVisible(this.heroHeading);
  }

  /**
   * ロゴが表示されていることを検証します
   */
  async verifyLogoVisible() {
    await this.waitForVisible(this.logo);
  }

  /**
   * ヒーローセクションが表示されていることを検証します
   */
  async verifyHeroSectionVisible() {
    await this.waitForVisible(this.heroHeading);
    await this.waitForVisible(this.heroDescription);
  }

  /**
   * ヒーローの見出しテキストを検証します
   */
  async verifyHeroHeading() {
    await expect(this.heroHeading).toContainText("集中もタスク管理も");
    await expect(this.heroHeading).toContainText("Ketchup");
  }

  /**
   * CTAボタンが表示されていることを検証します
   */
  async verifyCTAButtonsVisible() {
    await this.waitForVisible(this.registerButton);
    await this.waitForVisible(this.ctaLoginButton);
  }

  /**
   * ヘッダーのログインボタンが表示されていることを検証します
   */
  async verifyHeaderLoginButtonVisible() {
    await this.waitForVisible(this.headerLoginButton);
  }

  /**
   * 会員登録ボタンをクリックします
   *
   * Next.js の overlay 要素により Playwright が
   * pointer block と判定することがあるため、
   * 遷移確認目的として force:true を使用します。
   */
  async clickRegisterButton() {
    await this.registerButton.click({ force: true });
  }

  /**
   * CTAセクションのログインボタンをクリックします
   *
   * Next.js の overlay 要素により Playwright が
   * pointer block と判定することがあるため、
   * 遷移確認目的として force:true を使用します。   */
  async clickCTALoginButton() {
    await this.ctaLoginButton.click({ force: true });
  }

  /**
   * ヘッダーのログインボタンをクリックします
   *
   * Next.js の overlay 要素により Playwright が
   * pointer block と判定することがあるため、
   * 遷移確認目的として force:true を使用します。
   */
  async clickHeaderLoginButton() {
    await this.headerLoginButton.click({ force: true });
  }

  /**
   * 会員登録ボタンのリンク先を検証します
   */
  async verifyRegisterButtonLink() {
    await expect(this.registerButton).toHaveAttribute("href", "/auth/register");
  }

  /**
   * CTAログインボタンのリンク先を検証します
   */
  async verifyCTALoginButtonLink() {
    await expect(this.ctaLoginButton).toHaveAttribute("href", "/auth/login");
  }

  /**
   * ヘッダーログインボタンのリンク先を検証します
   */
  async verifyHeaderLoginButtonLink() {
    await expect(this.headerLoginButton).toHaveAttribute("href", "/auth/login");
  }

  /**
   * 機能紹介カードが表示されていることを検証します
   */
  async verifyFeatureCardsVisible() {
    await this.waitForVisible(this.pomodoroFeatureCard);
    await this.waitForVisible(this.todoFeatureCard);
  }

  /**
   * ポモドーロ機能カードの内容を検証します
   */
  async verifyPomodoroFeatureCard() {
    await this.waitForVisible(this.pomodoroFeatureCard);
    await expect(
      this.page.getByText(/25分集中＋5分休憩のサイクルをワンクリックで開始/)
    ).toBeVisible();
  }

  /**
   * Todoリスト機能カードの内容を検証します
   */
  async verifyTodoFeatureCard() {
    await this.waitForVisible(this.todoFeatureCard);
    await expect(
      this.page.getByText(/タスクと一緒にタイマーを起動して/)
    ).toBeVisible();
  }

  /**
   * ヘッダーが表示されていることを検証します
   */
  async verifyHeaderVisible() {
    await this.waitForVisible(this.header);
  }

  /**
   * フッターが表示されていることを検証します
   */
  async verifyFooterVisible() {
    await this.waitForVisible(this.footer);
  }

  /**
   * ページ全体のレイアウトを検証します
   */
  async verifyPageLayout() {
    await this.verifyHeaderVisible();
    await this.verifyLogoVisible();
    await this.verifyHeroSectionVisible();
    await this.verifyCTAButtonsVisible();
    await this.verifyFeatureCardsVisible();
    await this.verifyFooterVisible();
  }

  // Getter メソッド
  getLogo(): Locator {
    return this.logo;
  }

  getRegisterButton(): Locator {
    return this.registerButton;
  }

  getCTALoginButton(): Locator {
    return this.ctaLoginButton;
  }

  getHeaderLoginButton(): Locator {
    return this.headerLoginButton;
  }
}
