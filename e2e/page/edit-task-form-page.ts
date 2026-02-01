import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * タスク編集フォーム（モーダル）のページオブジェクト
 * タスク編集モーダルの要素と操作をカプセル化します
 */
export class EditTaskFormPage extends BasePage {
  // モーダル
  private readonly modal: Locator;

  // 見出し
  private readonly heading: Locator;
  private readonly description: Locator;

  // 閉じるボタン
  private readonly closeButton: Locator;

  // フォームフィールド
  private readonly titleInput: Locator;
  private readonly noteTextarea: Locator;
  private readonly dueAtInput: Locator;
  private readonly estimatedMinutesInput: Locator;

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

    // フォームフィールド
    this.titleInput = this.modal.getByLabel("タスク名");
    this.noteTextarea = this.modal.getByLabel("タスクの説明");
    this.dueAtInput = this.modal.getByLabel("期限");
    this.estimatedMinutesInput = this.modal.getByLabel("予定（分）");

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
    await this.waitForVisible(this.modal);
    await this.waitForVisible(this.heading);
  }

  /**
   * タスク名を入力します（既存値をクリアしてから入力）
   * @param title - タスク名
   */
  async fillTitle(title: string) {
    await this.titleInput.clear();
    await this.fill(this.titleInput, title);
  }

  /**
   * タスクの説明を入力します（既存値をクリアしてから入力）
   * @param note - 説明テキスト
   */
  async fillNote(note: string) {
    await this.noteTextarea.clear();
    await this.fill(this.noteTextarea, note);
  }

  /**
   * 期限を入力します
   * @param date - 日付文字列（yyyy-mm-dd）
   */
  async fillDueAt(date: string) {
    await this.fill(this.dueAtInput, date);
  }

  /**
   * 予定（分）を入力します（既存値をクリアしてから入力）
   * @param minutes - 分数
   */
  async fillEstimatedMinutes(minutes: string) {
    await this.estimatedMinutesInput.clear();
    await this.fill(this.estimatedMinutesInput, minutes);
  }

  /**
   * タスク名の現在の値を取得します
   */
  async getTitleValue(): Promise<string> {
    return this.titleInput.inputValue();
  }

  /**
   * タスクの説明の現在の値を取得します
   */
  async getNoteValue(): Promise<string> {
    return this.noteTextarea.inputValue();
  }

  /**
   * 期限の現在の値を取得します
   */
  async getDueAtValue(): Promise<string> {
    return this.dueAtInput.inputValue();
  }

  /**
   * 予定（分）の現在の値を取得します
   */
  async getEstimatedMinutesValue(): Promise<string> {
    return this.estimatedMinutesInput.inputValue();
  }

  /**
   * 更新するボタンをクリックします
   */
  async clickUpdate() {
    await this.updateButton.click();
    await this.verifyFormClosed();
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
    await this.verifyFormClosed();
  }

  /**
   * モーダルが閉じたことを検証します
   */
  async verifyFormClosed() {
    await expect(this.modal).not.toBeVisible({ timeout: 10000 });
  }

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

  // Getter メソッド
  getModal(): Locator {
    return this.modal;
  }

  getTitleInput(): Locator {
    return this.titleInput;
  }

  getNoteTextarea(): Locator {
    return this.noteTextarea;
  }

  getDueAtInput(): Locator {
    return this.dueAtInput;
  }

  getEstimatedMinutesInput(): Locator {
    return this.estimatedMinutesInput;
  }

  getCloseButton(): Locator {
    return this.closeButton;
  }

  getUpdateButton(): Locator {
    return this.updateButton;
  }

  getDeleteButton(): Locator {
    return this.deleteButton;
  }
}
