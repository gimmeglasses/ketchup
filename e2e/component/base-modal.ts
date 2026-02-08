import { Locator, expect } from "@playwright/test";
import { BaseComponent } from "./base-component";

/**
 * モーダルコンポーネントの基本クラス
 * ModalContainer.tsx の共通動作をテストするためのメソッドを提供します
 * - ESCキーでモーダルを閉じる
 * - 背景クリックでモーダルを閉じる
 * - 閉じるボタンでモーダルを閉じる
 */
export abstract class BaseModal extends BaseComponent {
  /**
   * モーダルダイアログのロケータ（サブクラスで実装）
   */
  protected abstract readonly modal: Locator;

  /**
   * モーダルが表示されていることを検証します
   */
  async verifyModalOpen() {
    await this.waitForVisible(this.modal);
  }

  /**
   * モーダルが閉じたことを検証します
   */
  async verifyModalClosed() {
    await expect(this.modal).toHaveCount(0, { timeout: 10000 });
  }

  /**
   * ESCキーでモーダルを閉じます
   * ModalContainer.tsx の keydown イベントハンドラをテストします
   */
  async closeByEscKey() {
    await this.page.keyboard.press("Escape");
  }

  /**
   * 背景（オーバーレイ）クリックでモーダルを閉じます
   * ModalContainer.tsx の外側div onClick をテストします
   * @param position - クリック位置（デフォルトは左上隅）
   */
  async closeByBackdropClick(
    position: { x: number; y: number } = { x: 5, y: 5 },
  ) {
    // ModalContainer.tsx: <div className="fixed inset-0 bg-black/50 ..." onClick={onClose}>
    await this.page.locator(".fixed.inset-0.bg-black\\/50").click({ position });
  }

  /**
   * 閉じるボタンでモーダルを閉じます
   * サブクラスで閉じるボタンがある場合にオーバーライドします
   */
  async closeByButton() {
    // サブクラスでオーバーライド
    throw new Error("closeByButton() is not implemented in this modal");
  }
}
