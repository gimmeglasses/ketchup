import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

/**
 * ダッシュボードページのページオブジェクト
 * タスク一覧・ポモドーロタイマーの要素と操作をカプセル化します
 */
export class DashboardPage extends BasePage {
  // ナビゲーション
  private readonly nav: Locator;
  private readonly navLogo: Locator;
  private readonly dashboardNavLink: Locator;
  private readonly tasksNavLink: Locator;

  // ページ見出し(今日のタスク)
  private readonly todayTasksHeading: Locator;

  // タスク追加ボタン
  private readonly addTaskButton: Locator;

  // タスク一覧
  private readonly taskList: Locator;

  // ポモドーロタイマー
  private readonly pomodoroSection: Locator;
  private readonly pomodoroHeading: Locator;
  private readonly startButton: Locator;
  private readonly stopButton: Locator;

  // ポモドーロタイマー：タスク切り替え確認ダイアログ
  private readonly confirmDialog: Locator;
  private readonly cancelButton: Locator;
  private readonly switchButton: Locator;

  /**
   * @param page - Playwrightのページインスタンス
   */
  constructor(page: Page) {
    super(page);

    // ナビゲーション
    this.nav = this.page.locator("nav:visible");
    this.navLogo = this.nav.getByAltText("Ketchup Logo");
    this.dashboardNavLink = this.nav.getByRole("link", {
      name: "ダッシュボード",
    });
    this.tasksNavLink = this.nav.getByRole("link", { name: "タスク一覧" });

    // ページ見出し
    this.todayTasksHeading = this.page.getByRole("heading", {
      name: "今日のタスク",
    });

    // タスク追加ボタン
    this.addTaskButton = this.page.getByRole("button", { name: "タスク追加" });

    // タスク一覧コンテナ
    this.taskList = this.page.locator("main");

    // ポモドーロタイマー
    this.pomodoroSection = this.page.locator("main");
    this.pomodoroHeading = this.page.getByRole("heading", {
      name: "ポモドーロタイマーを使う",
    });
    this.startButton = this.page.getByRole("button", { name: "START" });
    this.stopButton = this.page.getByRole("button", { name: "STOP" });

    // 確認ダイアログ
    this.confirmDialog = this.page.getByText(
      "タイマー実行中です。停止してから切り替えますか?",
    );
    this.cancelButton = this.page.getByRole("button", { name: "キャンセル" });
    this.switchButton = this.page.getByRole("button", { name: "切り替える" });
  }

  /**
   * ダッシュボードページに遷移します
   */
  async navigate() {
    await this.goto("/dashboard");
  }

  /**
   * ページが正しく読み込まれたことを検証します
   */
  async verifyPageLoaded() {
    await this.waitForVisible(this.addTaskButton);
    await this.waitForVisible(this.todayTasksHeading);
  }

  // --- ナビゲーション ---

  /**
   * ナビゲーションが表示されていることを検証します
   */
  async verifyNavVisible() {
    await this.waitForVisible(this.nav);
  }

  /**
   * タスク一覧リンクをクリックします
   */
  async clickTasksNavLink() {
    await this.tasksNavLink.click();
  }

  /**
   * ダッシュボードリンクをクリックします
   */
  async clickDashboardNavLink() {
    await this.dashboardNavLink.click();
  }

  // --- タスク追加 ---

  /**
   * タスク追加ボタンをクリックします
   */
  async clickAddTaskButton() {
    await this.addTaskButton.click();
  }

  /**
   * タスク追加ボタンが表示されていることを検証します
   */
  async verifyAddTaskButtonVisible() {
    await this.waitForVisible(this.addTaskButton);
  }

  // --- タスク一覧 ---

  /**
   * タスクが表示されていることを検証します
   * @param taskTitle - 検証するタスクのタイトル
   */
  async verifyTaskVisible(taskTitle: string) {
    await expect(this.page.getByText(taskTitle).first()).toBeVisible();
  }

  /**
   * タスクをクリックしてポモドーロタイマーに選択します
   * @param taskTitle - クリックするタスクのタイトル
   */
  async clickTask(taskTitle: string) {
    await this.page.getByText(taskTitle).first().click();
  }

  /**
   * タスクの完了ボタンをクリックします
   * @param taskName - タスク名
   */
  async clickCompleteButtonByTaskName(taskName: string) {
    const taskCard = this.page
      .locator("div.rounded-lg")
      .filter({ has: this.page.getByText(taskName, { exact: true }) })
      .filter({
        has: this.page.getByRole("button", { name: "タスクを完了する" }),
      });
    await taskCard.getByRole("button", { name: "タスクを完了する" }).click();
  }

  /**
   * タスクの編集ボタンをクリックします
   * @param taskName - タスク名
   */
  async clickEditButtonByTaskName(taskName: string) {
    const taskCard = this.page
      .locator("div.rounded-lg")
      .filter({ has: this.page.getByText(taskName, { exact: true }) })
      .filter({
        has: this.page.getByRole("button", { name: "タスクを編集する" }),
      });
    await taskCard.getByRole("button", { name: "タスクを編集する" }).click();
  }

  /**
   * タスク件数を取得します
   */
  async getTaskCount(): Promise<number> {
    return this.page.getByRole("button", { name: "タスクを完了する" }).count();
  }

  // --- ポモドーロタイマー ---

  /**
   * ポモドーロタイマーセクションが表示されていることを検証します
   */
  async verifyPomodoroVisible() {
    await this.waitForVisible(this.pomodoroHeading);
    await this.waitForVisible(this.startButton);
    await this.waitForVisible(this.stopButton);
  }

  /**
   * ポモドーロタイマーセクションにタスク名が表示されていることを検証します
   * @param expected - 期待するタスク名（例: "読書"）
   */
  async verifyPomodoroTask(expected: string) {
    const taskLocator = this.page.getByText(expected).first();
    await expect(taskLocator).toBeVisible();
  }

  /**
   * STARTボタンをクリックします
   */
  async clickStartButton() {
    await this.startButton.click();
  }

  /**
   * STOPボタンをクリックします
   */
  async clickStopButton() {
    await this.stopButton.click();
  }

  /**
   * STARTボタンが有効であることを検証します
   */
  async verifyStartButtonEnabled() {
    await this.waitForEnabled(this.startButton);
  }

  /**
   * STOPボタンが有効であることを検証します
   */
  async verifyStopButtonEnabled() {
    await this.waitForEnabled(this.stopButton);
  }

  /**
   * タイマー表示テキストを検証します
   * @param expected - 期待する表示（例: "25:00"）
   */
  async verifyTimerDisplay(expected: string) {
    await expect(this.page.getByText(expected)).toBeVisible();
  }

  // --- 確認ダイアログ ---

  /**
   * タスク切り替え確認ダイアログが表示されていることを検証します
   */
  async verifyConfirmDialogVisible() {
    await this.waitForVisible(this.confirmDialog);
    await this.waitForVisible(this.cancelButton);
    await this.waitForVisible(this.switchButton);
  }

  /**
   * キャンセルボタンをクリックします
   */
  async clickCancelButton() {
    await this.cancelButton.click();
  }

  /**
   * 切り替えるボタンをクリックします
   */
  async clickSwitchButton() {
    await this.switchButton.click();
  }
}
