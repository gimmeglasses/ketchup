import { Page, Locator, expect } from "@playwright/test";
import { BaseModal } from "./base-modal";
import { TaskFormFields } from "./task-form-fields";

/**
 * タスク編集モーダルのコンポーネント
 * タスク編集モーダルの要素と操作をカプセル化します
 */
export class EditTaskModal extends BaseModal {
  // モーダル
  protected readonly modal: Locator;

  // 見出し
  private readonly heading: Locator;
  private readonly description: Locator;

  // 閉じるボタン
  private readonly closeButton: Locator;

  // フォームフィールド
  private readonly formFields: TaskFormFields;

  // アクションボタン
  private readonly updateButton: Locator;
  private readonly deleteButton: Locator;

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
    this.heading = this.modal.getByRole("heading", { name: "タスク編集" });
    this.description = this.modal.getByText("タスク情報を編集してください");

    // 閉じるボタン
    this.closeButton = this.modal.getByRole("button", { name: "閉じる" });

    // フォームフィールド（共通クラスを使用）
    this.formFields = new TaskFormFields(this.modal);

    // アクションボタン
    this.updateButton = this.modal.getByRole("button", { name: "更新する" });
    this.deleteButton = this.modal.getByRole("button", { name: "削除する" });

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

  // --- フォーム入力メソッド（編集用：クリアしてから入力） ---

  /**
   * タスク名を入力します（既存値をクリアしてから入力）
   * @param title - タスク名
   */
  async fillTitle(title: string) {
    await this.formFields.clearAndFillTitle(title);
  }

  /**
   * タスクの説明を入力します（既存値をクリアしてから入力）
   * @param note - 説明テキスト
   */
  async fillNote(note: string) {
    await this.formFields.clearAndFillNote(note);
  }

  /**
   * 期限を入力します
   * @param date - 日付文字列（yyyy-mm-dd）
   */
  async fillDueAt(date: string) {
    await this.formFields.fillDueAt(date);
  }

  /**
   * 予定（分）を入力します（既存値をクリアしてから入力）
   * @param minutes - 分数
   */
  async fillEstimatedMinutes(minutes: string) {
    await this.formFields.clearAndFillEstimatedMinutes(minutes);
  }

  // --- 値取得メソッド ---

  /**
   * タスク名の現在の値を取得します
   */
  async getTitleValue(): Promise<string> {
    return this.formFields.titleInput.inputValue();
  }

  /**
   * タスクの説明の現在の値を取得します
   */
  async getNoteValue(): Promise<string> {
    return this.formFields.noteTextarea.inputValue();
  }

  /**
   * 期限の現在の値を取得します
   */
  async getDueAtValue(): Promise<string> {
    return this.formFields.dueAtInput.inputValue();
  }

  /**
   * 予定（分）の現在の値を取得します
   */
  async getEstimatedMinutesValue(): Promise<string> {
    return this.formFields.estimatedMinutesInput.inputValue();
  }

  // --- アクションメソッド ---

  /**
   * 更新するボタンをクリックします
   */
  async clickUpdate() {
    await this.updateButton.click();
    await this.verifyModalClosed();
  }

  /**
   * 削除するボタンをクリックします（削除確認モーダルが開きます）
   */
  async clickDelete() {
    await this.deleteButton.click();
  }

  /**
   * 閉じるボタンをクリックします
   */
  async clickClose() {
    await this.closeButton.click();
    await this.verifyModalClosed();
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
   * 送信ボタンが「更新中...」の状態であることを検証します
   */
  async verifyUpdating() {
    await expect(
      this.modal.getByRole("button", { name: "更新中..." }),
    ).toBeVisible();
  }
}
