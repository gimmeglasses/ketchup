import { Page, Locator, expect } from "@playwright/test";

/**
 * ページオブジェクトの基本クラス
 * Playwrightを使用したE2Eテストの共通メソッドを提供します
 */
export abstract class BasePage {
  protected readonly page: Page;

  /**
   * @param page - Playwrightのページインスタンス
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 指定したパスにナビゲートします
   * @param path - 遷移先のパス
   */
  async goto(path: string) {
    await this.page.goto(path);
  }

  /**
   * ページのタイトルを検証します
   * @param title - 期待するタイトル（文字列または正規表現）
   */
  async expectTitle(title: string | RegExp) {
    await expect(this.page).toHaveTitle(title);
  }

  /**
   * 要素が表示されていることを検証します
   * @param locator - 検証対象のロケータ
   */
  async waitForVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  async waitForEnabled(locator: Locator) {
    await expect(locator).toBeEnabled();
  }

  /**
   * 現在のURLに指定したパスが含まれていることを検証します
   * @param path - 検証するパス
   */
  async expectUrlContains(path: string) {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  /**
   * 要素をクリックします
   * @param locator - クリック対象のロケータ
   */
  async click(locator: Locator) {
    await locator.click();
  }

  /**
   * 要素にテキストを入力します
   * @param locator - 入力対象のロケータ
   * @param value - 入力するテキスト
   */
  async fill(locator: Locator, value: string) {
    await locator.fill(value);
  }

  /**
   * ページのスクリーンショットを保存します
   * @param name - スクリーンショットの名前（拡張子なし）
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  /**
   * テストを一時停止します（デバッグ用）
   */
  async pause() {
    await this.page.pause();
  }
}
