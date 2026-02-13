import { test, expect } from "@playwright/test";
import { TopPage } from "../page/top-page";
import { RegisterPage } from "../page/register-page";
import { LoginPage } from "../page/login-page";
import { DashboardPage } from "../page/dashboard-page";
import { NewTaskModal } from "../component/new-task-modal";
import { EditTaskModal } from "../component/edit-task-modal";
import { DeleteTaskModal } from "../component/delete-task-modal";

// サンプルタスク
const taskNameBF1 = "タスク1（編集前）";
const taskNameAF1 = "タスク1（編集後）";
const note1 = "タスク1：登録→編集→ポモドーロ（開始・終了）→完了";
const baseDate = new Date();

const dateForTask1 = new Date(baseDate);
dateForTask1.setDate(dateForTask1.getDate() + 10);
const dueAt1 = dateForTask1.toISOString().split("T")[0];
const estimatedMinutes1 = "120";

const taskName2 = "タスク2";
const note2 = "タスク2：登録→編集（期限）→編集（予定）→削除";
const dateForTask2Before = new Date(baseDate);
dateForTask2Before.setDate(dateForTask2Before.getDate() + 10);
const dueAtBF2 = dateForTask2Before.toISOString().split("T")[0];
const dateForTask2After = new Date(baseDate);
dateForTask2After.setDate(dateForTask2After.getDate() + 24);
const dueAtAF2 = dateForTask2After.toISOString().split("T")[0];
const estimatedMinutesBF2 = "180";
const estimatedMinutesAF2 = "240";

const taskName3 = "タスク3";
const note3 = "タスク3/4：登録→ポモドーロ（開始）→タスク切り替え";
const dateForTask3 = new Date(baseDate);
dateForTask3.setDate(dateForTask3.getDate() + 24);
const dueAt3 = dateForTask3.toISOString().split("T")[0];
const estimatedMinutes3 = "180";

const taskName4 = "タスク4";
const note4 = "タスク3/4：タスク切り替え→ポモドーロ（開始・停止）→画面切り替え";

test.describe("アプリケーション統合シナリオ", () => {
  test("会員登録からダッシュボード操作までの統合シナリオ", async ({ page }) => {
    // ページオブジェクト初期化
    const topPage = new TopPage(page);
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const newTaskModal = new NewTaskModal(page);
    const editTaskModal = new EditTaskModal(page);
    const deleteTaskModal = new DeleteTaskModal(page);

    // ユーザー登録用のテストデータを生成
    const unique = Date.now();
    const testName = `e2e test User ${unique}`;
    const testEmail = `test-${unique}@example.com`;
    const testPassword = "password";

    let confirmationLink: string;

    // --- 会員登録・ログイン ---
    await test.step("トップページから会員登録ページへ遷移", async () => {
      await topPage.navigate();
      await topPage.verifyPageLoaded();
      await Promise.all([
        topPage.clickRegisterButton(),
        page.waitForURL(/\/auth\/register/, { timeout: 10000 }),
      ]);
    });

    await test.step("会員登録フォームに入力して登録", async () => {
      await registerPage.verifyFormVisible();
      await registerPage.fillRegisterForm(testName, testEmail, testPassword);
      await registerPage.clickRegisterButton();
      await registerPage.verifyRegistrationSuccess();
    });

    await test.step("確認メール受信と確認リンク抽出", async () => {
      const confirmationEmail =
        await registerPage.waitForConfirmationEmail(testEmail);
      expect(confirmationEmail).toBeDefined();

      const link = registerPage
        .getMailpitHelper()
        .extractConfirmationLink(confirmationEmail);
      expect(link).not.toBeNull();
      confirmationLink = link!;
    });

    await test.step("確認リンクにアクセスしてリダイレクト待機", async () => {
      const response = await page.goto(confirmationLink);
      expect(response?.status()).toBeLessThan(400);

      await page.waitForURL(
        /\/auth\/(login|confirm|register\/success)|\/(dashboard)/,
        {
          timeout: 15000,
        },
      );
      const afterConfirmUrl = page.url();

      if (afterConfirmUrl.includes("/auth/confirm")) {
        await page.waitForURL(/\/auth\/login|\/(dashboard)/, {
          timeout: 15000,
        });
      }
    });

    await test.step("ログインページからログイン", async () => {
      await expect(page).toHaveURL(/\/auth\/login/);
      await loginPage.fillLoginForm(testEmail, testPassword);
      await loginPage.clickLoginButton();
    });

    await test.step("ダッシュボード表示確認", async () => {
      await expect(page).toHaveURL(/\/dashboard/);
    });

    // --- ダッシュボードシナリオ（同一セッションで継続） ---

    // --- シナリオ１ ---
    await test.step("タスク登録 → 編集 → ポモドーロ（開始・終了） → 完了の一連の操作ができること", async () => {
      await page.goto("/dashboard");
      await dashboardPage.verifyPageLoaded();

      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(taskNameBF1);
      await newTaskModal.fillNote(note1);
      await newTaskModal.fillDueAt(dueAt1);
      await newTaskModal.fillEstimatedMinutes(estimatedMinutes1);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(taskNameBF1);

      // --- タスク1編集（タスク名変更） ---
      await dashboardPage.clickEditButtonByTaskName(taskNameBF1);
      await editTaskModal.verifyFormVisible();

      await editTaskModal.fillTitle(taskNameAF1);
      await editTaskModal.clickUpdate();

      await dashboardPage.verifyTaskVisible(taskNameAF1);
      await dashboardPage.verifyPageLoaded();

      // --- ポモドーロ開始・停止 ---
      await dashboardPage.clickTask(taskNameAF1);
      await dashboardPage.verifyPomodoroVisible();
      await dashboardPage.verifyStartButtonEnabled();
      await dashboardPage.verifyTimerDisplay("25");

      await dashboardPage.clickStartButton();
      await dashboardPage.verifyStopButtonEnabled();
      await expect(page.getByText("25:00")).not.toBeVisible();

      await page.waitForTimeout(2000);

      await dashboardPage.clickStopButton();
      await dashboardPage.verifyStartButtonEnabled();
      await dashboardPage.verifyTimerDisplay("25");

      // --- タスク1完了 ---
      await dashboardPage.clickCompleteButtonByTaskName(taskNameAF1);
      await page.waitForTimeout(1000);
      await expect(
        page.getByText(taskNameAF1, { exact: true }),
      ).not.toBeVisible();
      await dashboardPage.verifyPageLoaded();
    });

    // --- シナリオ２ ---
    await test.step("タスク登録 → 編集（期限・予定の更新） → 削除の一連の操作ができること", async () => {
      await page.goto("/dashboard");
      await dashboardPage.verifyPageLoaded();

      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(taskName2);
      await newTaskModal.fillNote(note2);
      await newTaskModal.fillDueAt(dueAtBF2);
      await newTaskModal.fillEstimatedMinutes(estimatedMinutesBF2);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(taskName2);

      // --- タスク2編集（期間・予定変更） ---
      await dashboardPage.clickEditButtonByTaskName(taskName2);
      await editTaskModal.verifyFormVisible();

      await editTaskModal.fillDueAt(dueAtAF2);
      await editTaskModal.fillEstimatedMinutes(estimatedMinutesAF2);
      await editTaskModal.clickUpdate();

      await dashboardPage.verifyTaskVisible(taskName2);
      await dashboardPage.verifyPageLoaded();

      // --- タスク2削除 ---
      await dashboardPage.clickEditButtonByTaskName(taskName2);
      await editTaskModal.verifyFormVisible();
      await editTaskModal.clickDelete();

      await deleteTaskModal.verifyFormVisible();
      await deleteTaskModal.verifyTaskTitle(taskName2);

      await deleteTaskModal.clickDelete();

      await expect(
        page.getByText(taskName2, { exact: true }),
      ).not.toBeVisible();
      await dashboardPage.verifyPageLoaded();
    });

    // --- シナリオ３ ---
    await test.step("タスク登録 → ポモドーロ（開始） → タスク切り替え → ポモドーロ（開始・停止） → 画面切り替えの一連の操作ができること", async () => {
      await page.goto("/dashboard");
      await dashboardPage.verifyPageLoaded();

      // --- タスク3登録 ---
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(taskName3);
      await newTaskModal.fillNote(note3);
      await newTaskModal.fillDueAt(dueAt3);
      await newTaskModal.fillEstimatedMinutes(estimatedMinutes3);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(taskName3);

      // --- タスク3ポモドーロ開始 ---
      await dashboardPage.clickTask(taskName3);
      await dashboardPage.verifyPomodoroVisible();
      await dashboardPage.verifyStartButtonEnabled();
      await dashboardPage.verifyTimerDisplay("25");

      await dashboardPage.clickStartButton();
      await dashboardPage.verifyStopButtonEnabled();
      await expect(page.getByText("25:00")).not.toBeVisible();

      // --- タスク4登録 ---
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(taskName4);
      await newTaskModal.fillNote(note4);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(taskName4);

      // --- タスク切り替え(3->4) ---
      await dashboardPage.clickTask(taskName4);
      await dashboardPage.verifyConfirmDialogVisible();

      await dashboardPage.clickSwitchButton();
      await dashboardPage.verifyPomodoroTask(taskName4);
      await dashboardPage.verifyPomodoroVisible();

      // --- タスク4ポモドーロ開始 ---
      await dashboardPage.clickStartButton();
      await page.waitForTimeout(2000);

      await dashboardPage.clickStopButton();
      await dashboardPage.verifyStartButtonEnabled();
      await dashboardPage.verifyTimerDisplay("25");

      // --- ナビゲーション1（ダッシュボード -> タスク一覧） ---
      await dashboardPage.clickTasksNavLink();
      await dashboardPage.expectUrlContains("/tasks");

      // --- ナビゲーション2（タスク一覧 -> ダッシュボード） ---
      await dashboardPage.clickDashboardNavLink();
      await dashboardPage.expectUrlContains("/dashboard");
      await dashboardPage.verifyPageLoaded();
    });
  });
});
