import { test, expect } from "@playwright/test";
import { resetTaskData } from "../db/task-data.reset";
import { TopPage } from "../page/top-page";
import { RegisterPage } from "../page/register-page";
import { LoginPage } from "../page/login-page";
import { DashboardPage } from "../page/dashboard-page";
import { NewTaskModal } from "../component/new-task-modal";
import { EditTaskModal } from "../component/edit-task-modal";
import { DeleteTaskModal } from "../component/delete-task-modal";
import { getUserId } from "../helper/supabaseGetUserId";

// サンプルタスク
const taskName1 = "読書";
const note1 = "Scrum Boot Camp を読む";
const date = new Date();
date.setDate(date.getDate() + 10);
const dueAt1 = date.toISOString().split("T")[0];
const estimatedMinutes1 = "120";

const taskName2 = "レポート作成";
const note2 = "コラボレーティブ開発特論のレポートを書く";
const dueAt2 = date.toISOString().split("T")[0];
const estimatedMinutes2 = "180";

// タスク編集
const beforeEditTask = "編集テスト用タスク（Before）";
const afterEditTask = "編集テスト用タスク（After）";

// タスク削除
const deleteTargetTask = "削除テスト用タスク";

// タスク完了
const completeTargetTask = "完了テスト用タスク";

// ポモドーロタイマー
const pomodoroTargetTask1 = "ポモドーロテスト用タスク１";
const pomodoroTargetTask2 = "ポモドーロテスト用タスク２";

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

    // const cookieStore = await cookies(page);
    // console.log(`user session: ${cookieStore}`);
    const userId = await getUserId(page);

    console.log(`user session: ${userId}`);

    // --- ダッシュボードシナリオ（同一セッションで継続） ---

    // --- タスク登録 ---
    await test.step("タスク登録の後、ダッシュボード画面にタスクが一覧表示されていること", async () => {
      await resetTaskData(userId);
      await page.goto("/dashboard");
      await dashboardPage.verifyPageLoaded();

      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(taskName1);
      await newTaskModal.fillNote(note1);
      await newTaskModal.fillDueAt(dueAt1);
      await newTaskModal.fillEstimatedMinutes(estimatedMinutes1);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(taskName1);

      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(taskName2);
      await newTaskModal.fillNote(note2);
      await newTaskModal.fillDueAt(dueAt2);
      await newTaskModal.fillEstimatedMinutes(estimatedMinutes2);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(taskName2);

      expect(await dashboardPage.getTaskCount()).toBe(2);
      await dashboardPage.verifyPageLoaded();
    });

    // --- タスク編集 ---
    await test.step("タスク編集の後、ダッシュボード画面に変更後のタスクが表示されていること", async () => {
      await resetTaskData(userId);
      await page.goto("/dashboard");
      await dashboardPage.verifyPageLoaded();

      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(beforeEditTask);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(beforeEditTask);

      await dashboardPage.clickEditButton(0);
      await editTaskModal.verifyFormVisible();

      await editTaskModal.fillTitle(afterEditTask);
      await editTaskModal.clickUpdate();

      await dashboardPage.verifyTaskVisible(afterEditTask);
      await dashboardPage.verifyPageLoaded();
    });

    // --- タスク削除 ---
    await test.step("タスク削除の後、ダッシュボード画面からタスクが消えていること", async () => {
      await resetTaskData(userId);
      await page.goto("/dashboard");
      await dashboardPage.verifyPageLoaded();

      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(deleteTargetTask);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(deleteTargetTask);

      await dashboardPage.clickEditButton(0);
      await editTaskModal.verifyFormVisible();
      await editTaskModal.clickDelete();

      await deleteTaskModal.verifyFormVisible();
      await deleteTaskModal.verifyTaskTitle(deleteTargetTask);

      await deleteTaskModal.clickDelete();

      await expect(
        page.getByText(deleteTargetTask, { exact: true }),
      ).not.toBeVisible();
      await dashboardPage.verifyPageLoaded();
    });

    // --- タスク完了 ---
    await test.step("タスクを完了すると、ダッシュボード画面から消えること", async () => {
      await resetTaskData(userId);
      await page.goto("/dashboard");
      await dashboardPage.verifyPageLoaded();

      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(completeTargetTask);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(completeTargetTask);

      await dashboardPage.clickCompleteButton(0);

      await expect(
        page.getByText(completeTargetTask, { exact: true }),
      ).not.toBeVisible();
      await dashboardPage.verifyPageLoaded();
    });

    // --- ポモドーロタイマー実行 ---
    await test.step("タスク登録の後、ポモドーロタイマーが表示し、開始・終了すること", async () => {
      await resetTaskData(userId);
      await page.goto("/dashboard");
      await dashboardPage.verifyPageLoaded();

      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(pomodoroTargetTask1);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(pomodoroTargetTask1);

      await dashboardPage.clickTask(pomodoroTargetTask1);
      await dashboardPage.verifyPomodoroVisible();
      await dashboardPage.verifyStartButtonEnabled();
      await dashboardPage.verifyTimerDisplay("25");

      await dashboardPage.clickStartButton();
      await expect(page.getByText("25:00")).not.toBeVisible();
      await dashboardPage.verifyStopButtonEnabled();

      await page.waitForTimeout(2000);

      await dashboardPage.clickStopButton();
      await dashboardPage.verifyStartButtonEnabled();
      await dashboardPage.verifyTimerDisplay("25");
    });

    await test.step("ポモドーロタイマー実行中に別のタスクを選択すると、確認画面が表示し、タスクを切り替えられること", async () => {
      await resetTaskData(userId);
      await page.goto("/dashboard");
      await dashboardPage.verifyPageLoaded();

      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(pomodoroTargetTask1);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(pomodoroTargetTask1);

      await page.goto("/dashboard");
      await dashboardPage.verifyPageLoaded();
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(pomodoroTargetTask2);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(pomodoroTargetTask2);

      await dashboardPage.clickTask(pomodoroTargetTask1);
      await dashboardPage.clickStartButton();
      await dashboardPage.clickTask(pomodoroTargetTask2);
      await dashboardPage.verifyConfirmDialogVisible();

      await dashboardPage.clickSwitchButton();
      await dashboardPage.verifyPomodoroTask(pomodoroTargetTask2);
      await dashboardPage.verifyPomodoroVisible();
    });

    // --- ナビゲーション ---
    await test.step("ダッシュボードからタスク一覧ページに遷移できること", async () => {
      await page.goto("/dashboard");
      await dashboardPage.verifyPageLoaded();

      await dashboardPage.clickTasksNavLink();

      await dashboardPage.expectUrlContains("/tasks");
    });

    await test.step("タスク一覧ページからダッシュボードに戻れること", async () => {
      await page.goto("/tasks");

      await dashboardPage.clickDashboardNavLink();

      await dashboardPage.expectUrlContains("/dashboard");
      await dashboardPage.verifyPageLoaded();
    });
  });
});
