import { Locator } from "@playwright/test";

/**
 * タスクフォームのフィールドを管理するクラス
 * NewTaskModal と EditTaskModal で共有されるフォームフィールドを提供します
 */
export class TaskFormFields {
  readonly titleInput: Locator;
  readonly noteTextarea: Locator;
  readonly dueAtInput: Locator;
  readonly estimatedMinutesInput: Locator;

  /**
   * @param modal - モーダルダイアログのロケータ
   */
  constructor(modal: Locator) {
    this.titleInput = modal.getByLabel("タスク名");
    this.noteTextarea = modal.getByLabel("タスクの説明");
    this.dueAtInput = modal.getByLabel("期限");
    this.estimatedMinutesInput = modal.getByLabel("予定（分）");
  }

  /**
   * タスク名を入力します
   * @param title - タスク名
   */
  async fillTitle(title: string) {
    await this.titleInput.fill(title);
  }

  /**
   * タスクの説明を入力します
   * @param note - 説明テキスト
   */
  async fillNote(note: string) {
    await this.noteTextarea.fill(note);
  }

  /**
   * 期限を入力します
   * @param date - 日付文字列（yyyy-mm-dd）
   */
  async fillDueAt(date: string) {
    await this.dueAtInput.fill(date);
  }

  /**
   * 予定（分）を入力します
   * @param minutes - 分数
   */
  async fillEstimatedMinutes(minutes: string) {
    await this.estimatedMinutesInput.fill(minutes);
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
    if (fields.estimatedMinutes) await this.fillEstimatedMinutes(fields.estimatedMinutes);
  }

  /**
   * タスク名をクリアしてから入力します（編集用）
   * @param title - タスク名
   */
  async clearAndFillTitle(title: string) {
    await this.titleInput.clear();
    await this.titleInput.fill(title);
  }

  /**
   * タスクの説明をクリアしてから入力します（編集用）
   * @param note - 説明テキスト
   */
  async clearAndFillNote(note: string) {
    await this.noteTextarea.clear();
    await this.noteTextarea.fill(note);
  }

  /**
   * 予定（分）をクリアしてから入力します（編集用）
   * @param minutes - 分数
   */
  async clearAndFillEstimatedMinutes(minutes: string) {
    await this.estimatedMinutesInput.clear();
    await this.estimatedMinutesInput.fill(minutes);
  }
}
