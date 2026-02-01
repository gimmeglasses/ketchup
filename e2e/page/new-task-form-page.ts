import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * タスク登録フォーム（モーダル）のページオブジェクト
 * 新規タスク作成モーダルの要素と操作をカプセル化します
 */
export class NewTaskFormPage extends BasePage {
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

    // フォームフィールド
    this.titleInput = this.modal.getByLabel("タスク名");
    this.noteTextarea = this.modal.getByLabel("タスクの説明");
    this.dueAtInput = this.modal.getByLabel("期限");
    this.estimatedMinutesInput = this.modal.getByLabel("予定（分）");

    // 送信ボタン
    this.submitButton = this.modal.getByRole("button", { name: "登録する" });

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
   * タスク名を入力します
   * @param title - タスク名
   */
  async fillTitle(title: string) {
    await this.fill(this.titleInput, title);
  }

  /**
   * タスクの説明を入力します
   * @param note - 説明テキスト
   */
  async fillNote(note: string) {
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
   * 予定（分）を入力します
   * @param minutes - 分数
   */
  async fillEstimatedMinutes(minutes: string) {
    await this.fill(this.estimatedMinutesInput, minutes);
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
    await this.fillTitle(fields.title);
    if (fields.note) await this.fillNote(fields.note);
    if (fields.dueAt) await this.fillDueAt(fields.dueAt);
    if (fields.estimatedMinutes)
      await this.fillEstimatedMinutes(fields.estimatedMinutes);
  }

  /**
   * 登録するボタンをクリックします
   */
  async clickSubmit() {
    await this.submitButton.click();
    await this.verifyFormClosed();
  }

  /**
   * 閉じるボタンをクリックします
   */
  async clickClose() {
    await this.closeButton.click();
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
   * 送信ボタンが「登録中...」の状態であることを検証します
   */
  async verifySubmitting() {
    await expect(
      this.modal.getByRole("button", { name: "登録中..." })
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

  getSubmitButton(): Locator {
    return this.submitButton;
  }
}
