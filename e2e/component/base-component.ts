import { Page, Locator, expect } from "@playwright/test";

/**
 * コンポーネントの基本クラス
 * ページ内のコンポーネント（モーダル等）の共通メソッドを提供します
 * ナビゲーション機能は含まれません
 */
export abstract class BaseComponent {
  protected readonly page: Page;

  /**
   * @param page - Playwrightのページインスタンス
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 要素が表示されていることを検証します
   * @param locator - 検証対象のロケータ
   */
  async waitForVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  /**
   * 要素が有効であることを検証します
   * @param locator - 検証対象のロケータ
   */
  async waitForEnabled(locator: Locator) {
    await expect(locator).toBeEnabled();
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
}
