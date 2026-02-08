import { Page, Locator, expect } from "@playwright/test";
import { BaseModal } from "./base-modal";

/**
 * タスク削除確認モーダルのコンポーネント
 * 削除確認ダイアログの要素と操作をカプセル化します
 */
export class DeleteTaskModal extends BaseModal {
  // モーダル
  protected readonly modal: Locator;

  // 確認メッセージ
  private readonly warningMessage: Locator;

  // アクションボタン
  private readonly cancelButton: Locator;
  private readonly deleteButton: Locator;

  // エラーメッセージ
  private readonly errorAlert: Locator;
  private readonly errorDismissButton: Locator;

  /**
   * @param page - Playwrightのページインスタンス
   */
  constructor(page: Page) {
    super(page);

    // モーダルダイアログ
    this.modal = this.page.getByRole("dialog", { name: "タスクフォーム" });

    // 確認メッセージ
    this.warningMessage = this.page.getByText("この操作は取り消せません。");

    // アクションボタン
    this.cancelButton = this.page.getByRole("button", { name: "キャンセル" });
    this.deleteButton = this.page.getByRole("button", {
      name: "削除",
      exact: true,
    });

    // エラーメッセージ
    this.errorAlert = this.page.getByRole("alert");
    this.errorDismissButton = this.page.getByRole("button", {
      name: "エラーメッセージを閉じる",
    });
  }

  /**
   * 削除確認ダイアログが表示されていることを検証します
   * @deprecated verifyModalOpen() を使用してください
   */
  async verifyFormVisible() {
    await this.waitForVisible(this.warningMessage);
    await this.waitForVisible(this.cancelButton);
    await this.waitForVisible(this.deleteButton);
  }

  /**
   * モーダルが閉じたことを検証します
   * @deprecated verifyModalClosed() を使用してください
   */
  async verifyFormClosed() {
    await this.verifyModalClosed();
  }

  /**
   * 削除対象のタスク名が表示されていることを検証します
   * @param taskTitle - 削除対象のタスク名
   */
  async verifyTaskTitle(taskTitle: string) {
    await expect(
      this.page.getByText(`「${taskTitle}」を削除します。`),
    ).toBeVisible();
  }

  // --- アクションメソッド ---

  /**
   * 削除ボタンをクリックします
   */
  async clickDelete() {
    await this.deleteButton.click();
    await this.verifyModalClosed();
  }

  /**
   * キャンセルボタンをクリックします
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  // --- 検証メソッド ---

  /**
   * 削除ボタンが「削除しています...」の状態であることを検証します
   */
  async verifyDeleting() {
    await expect(
      this.page.getByRole("button", { name: "削除しています..." }),
    ).toBeVisible();
  }

  /**
   * エラーメッセージが表示されていることを検証します
   * @param message - 期待するエラーメッセージ
   */
  async verifyError(message: string) {
    await expect(this.errorAlert.getByText(message)).toBeVisible();
  }

  /**
   * エラーメッセージを閉じます
   */
  async dismissError() {
    await this.errorDismissButton.click();
  }
}
