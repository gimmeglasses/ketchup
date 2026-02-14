import { Page, Locator, expect } from "@playwright/test";
import { BaseModal } from "./base-modal";
import { TaskFormFields } from "./task-form-fields";

/**
 * タスク登録モーダルのコンポーネント
 * 新規タスク作成モーダルの要素と操作をカプセル化します
 */
export class NewTaskModal extends BaseModal {
  // モーダル
  protected readonly modal: Locator;

  // 見出し
  private readonly heading: Locator;
  private readonly description: Locator;

  // 閉じるボタン
  private readonly closeButton: Locator;

  // フォームフィールド
  private readonly formFields: TaskFormFields;

  // 送信ボタン
  private readonly submitButton: Locator;

  // エラーメッセージ
  private readonly formError: Locator;

  /**
   * @param page - Playwrightのページインスタンス
   */
  constructor(page: Page) {
    super(page);

    // モーダルダイアログ
    this.modal = this.page.getByRole("dialog", { name: "タスクフォーム" });

    // 見出し
    this.heading = this.modal.getByRole("heading", { name: "タスク登録" });
    this.description = this.modal.getByText("新しいタスクを入力してください");

    // 閉じるボタン
    this.closeButton = this.modal.getByRole("button", { name: "閉じる" });

    // フォームフィールド（共通クラスを使用）
    this.formFields = new TaskFormFields(this.modal);

    // 送信ボタン
    this.submitButton = this.modal.getByRole("button", { name: "登録する" });

    // エラーメッセージ
    this.formError = this.modal.locator("form p.text-red-500");
  }

  /**
   * モーダルが表示されていることを検証します
   */
  async verifyFormVisible() {
    await this.verifyModalOpen();
    await this.waitForVisible(this.heading);
  }

  /**
   * モーダルが閉じたことを検証します
   */
  async verifyFormClosed() {
    await this.verifyModalClosed();
  }

  /**
   * 閉じるボタンでモーダルを閉じます
   */
  override async closeByButton() {
    await this.closeButton.click();
  }

  // --- フォーム入力メソッド ---

  /**
   * タスク名を入力します
   * @param title - タスク名
   */
  async fillTitle(title: string) {
    await this.formFields.fillTitle(title);
  }

  /**
   * タスクの説明を入力します
   * @param note - 説明テキスト
   */
  async fillNote(note: string) {
    await this.formFields.fillNote(note);
  }

  /**
   * 期限を入力します
   * @param date - 日付文字列（yyyy-mm-dd）
   */
  async fillDueAt(date: string) {
    await this.formFields.fillDueAt(date);
  }

  /**
   * 予定（分）を入力します
   * @param minutes - 分数
   */
  async fillEstimatedMinutes(minutes: string) {
    await this.formFields.fillEstimatedMinutes(minutes);
  }

  /**
   * 全フィールドを入力します
   */
  async fillForm(fields: {
    title: string;
    note?: string;
    dueAt?: string;
    estimatedMinutes?: string;
  }) {
    await this.formFields.fillForm(fields);
  }

  // --- アクションメソッド ---

  /**
   * 登録するボタンをクリックします
   */
  async clickSubmit() {
    await this.submitButton.click();
    await this.verifyModalClosed();
  }

  /**
   * 閉じるボタンをクリックします
   */
  async clickClose() {
    await this.closeButton.click();
  }

  // --- 検証メソッド ---

  /**
   * フォームエラーが表示されていることを検証します
   * @param message - 期待するエラーメッセージ
   */
  async verifyFormError(message: string) {
    await expect(this.formError.getByText(message)).toBeVisible();
  }

  /**
   * 送信ボタンが「登録中...」の状態であることを検証します
   */
  async verifySubmitting() {
    await expect(
      this.modal.getByRole("button", { name: "登録中..." }),
    ).toBeVisible();
  }
}
