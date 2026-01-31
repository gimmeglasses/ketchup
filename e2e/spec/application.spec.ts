import { test, expect } from "@playwright/test";
import { resetDataBase } from "@/app/db/reset";
import { TopPage } from "../page/top-page";
import { RegisterPage } from "../page/register-page";
import { LoginPage } from "../page/login-page";
import { DashboardPage } from "../page/dashboard-page";
import { NewTaskFormPage } from "../page/new-task-form-page";
import { EditTaskFormPage } from "../page/edit-task-form-page";
import { DeleteTaskFormPage } from "../page/delete-task-form-page";

let topPage: TopPage;
let registerPage: RegisterPage;
let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let newTaskFormPage: NewTaskFormPage;
let editTaskFormPage: EditTaskFormPage;
let deleteTaskFormPage: DeleteTaskFormPage;

// ログイン情報を保管
const authFile = "e2e/.auth/user.json";

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

// ファイル全体をシリアル実行にして、会員登録 → ダッシュボードの順序を保証する
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  topPage = new TopPage(page);
  registerPage = new RegisterPage(page);
  loginPage = new LoginPage(page);
  dashboardPage = new DashboardPage(page);
  newTaskFormPage = new NewTaskFormPage(page);
  editTaskFormPage = new EditTaskFormPage(page);
  deleteTaskFormPage = new DeleteTaskFormPage(page);
});

// --- 会員登録・ログイン（storageState なしで実行） ---
test.describe("アプリケーション統合シナリオ", () => {
  test("会員登録からログインしてダッシュボードに遷移できること", async ({
    page,
  }) => {
    // ユーザー登録用のテストデータを生成
    const unique = Date.now();
    const testName = `e2e test User ${unique}`;
    const testEmail = `test-${unique}@example.com`;
    const testPassword = "password";

    let confirmationLink: string;

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

    await page.context().storageState({ path: authFile });

    await test.step("ダッシュボード表示確認", async () => {
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });
});

// --- ダッシュボードシナリオ（会員登録で保存した storageState を使用） ---
test.describe("ダッシュボードシナリオ", () => {
  test.use({ storageState: authFile });

  // --- タスク登録 ---
  test.describe("タスク登録", () => {
    test.beforeEach(async () => {
      await resetDataBase();
    });

    test("タスク登録の後、ダッシュボード画面にタスクが一覧表示されていること", async ({
      page,
    }) => {
      await test.step("タスク1を登録する", async () => {
        await page.goto("/dashboard");
        await dashboardPage.clickAddTaskButton();
        await newTaskFormPage.fillTitle(taskName1);
        await newTaskFormPage.fillNote(note1);
        await newTaskFormPage.fillDueAt(dueAt1);
        await newTaskFormPage.fillEstimatedMinutes(estimatedMinutes1);
        await newTaskFormPage.clickSubmit();
      });

      await test.step("タスク1が一覧表示されていること", async () => {
        await dashboardPage.verifyTaskVisible(taskName1);
      });

      await test.step("タスク2を登録する", async () => {
        await dashboardPage.clickAddTaskButton();
        await newTaskFormPage.fillTitle(taskName2);
        await newTaskFormPage.fillNote(note2);
        await newTaskFormPage.fillDueAt(dueAt2);
        await newTaskFormPage.fillEstimatedMinutes(estimatedMinutes2);
        await newTaskFormPage.clickSubmit();
      });

      await test.step("タスク2が一覧表示されていること", async () => {
        await dashboardPage.verifyTaskVisible(taskName2);
      });

      await test.step("2つのタスクが一覧に表示されていること", async () => {
        expect(await dashboardPage.getTaskCount()).toBe(2);
      });
      // ブラウザ上で結果を確認するために設定
      await page.waitForTimeout(1000);
    });
  });

  // --- タスク編集 ---
  test.describe("タスク編集", () => {
    const beforeEditTask = "編集テスト用タスク（Before）";
    const afterEditTask = "編集テスト用タスク（After）";

    test.beforeEach(async () => {
      await resetDataBase();
    });

    test("タスク編集の後、ダッシュボード画面に変更後のタスクが表示されていること", async ({
      page,
    }) => {
      await test.step("タスクを登録する", async () => {
        await page.goto("/dashboard");
        await dashboardPage.clickAddTaskButton();
        await newTaskFormPage.fillTitle(beforeEditTask);
        await newTaskFormPage.clickSubmit();
        await dashboardPage.verifyTaskVisible(beforeEditTask);
      });

      await test.step("編集フォームを開く", async () => {
        await dashboardPage.clickEditButton(0);
        await editTaskFormPage.verifyFormVisible();
      });

      await test.step("タスク名を変更して更新する", async () => {
        await editTaskFormPage.fillTitle(afterEditTask);
        await editTaskFormPage.clickUpdate();
      });

      await test.step("変更後のタスクが一覧に表示されていること", async () => {
        await dashboardPage.verifyTaskVisible(afterEditTask);
      });
      // ブラウザ上で結果を確認するために設定
      await page.waitForTimeout(1000);
    });
  });

  // --- タスク削除 ---
  test.describe("タスク削除", () => {
    const deleteTargetTask = "削除テスト用タスク";

    test.beforeEach(async () => {
      await resetDataBase();
    });

    test("タスク削除の後、ダッシュボード画面からタスクが消えていること", async ({
      page,
    }) => {
      await test.step("タスクを登録する", async () => {
        await page.goto("/dashboard");
        await dashboardPage.clickAddTaskButton();
        await newTaskFormPage.fillTitle(deleteTargetTask);
        await newTaskFormPage.clickSubmit();
        await dashboardPage.verifyTaskVisible(deleteTargetTask);
      });

      await test.step("編集フォームから削除ボタンを押す", async () => {
        await dashboardPage.clickEditButton(0);
        await editTaskFormPage.verifyFormVisible();
        await editTaskFormPage.clickDelete();
      });

      await test.step("削除確認ダイアログが表示されること", async () => {
        await deleteTaskFormPage.verifyFormVisible();
        await deleteTaskFormPage.verifyTaskTitle(deleteTargetTask);
      });

      await test.step("削除を実行する", async () => {
        await deleteTaskFormPage.clickDelete();
      });

      await test.step("タスクが一覧から消えていること", async () => {
        await expect(
          page.getByText(deleteTargetTask, { exact: true }),
        ).not.toBeVisible();
      });
      // ブラウザ上で結果を確認するために設定
      await page.waitForTimeout(1500);
    });
  });

  // --- タスク完了 ---
  test.describe("タスク完了", () => {
    const completeTargetTask = "完了テスト用タスク";

    test.beforeEach(async () => {
      await resetDataBase();
    });

    test("タスクを完了すると、ダッシュボード画面から消えること", async ({
      page,
    }) => {
      await test.step("タスクを登録する", async () => {
        await page.goto("/dashboard");
        await dashboardPage.clickAddTaskButton();
        await newTaskFormPage.fillTitle(completeTargetTask);
        await newTaskFormPage.clickSubmit();
        await dashboardPage.verifyTaskVisible(completeTargetTask);
      });

      await test.step("完了ボタンをクリックする", async () => {
        await dashboardPage.clickCompleteButton(0);
      });

      await test.step("タスクが一覧から消えていること", async () => {
        await expect(
          page.getByText(completeTargetTask, { exact: true }),
        ).not.toBeVisible();
      });
      // ブラウザ上で結果を確認するために設定
      await page.waitForTimeout(2000);
    });
  });

  // --- ポモドーロタイマー実行 ---
  test.describe("ポモドーロタイマー実行", () => {
    const pomodoroTargetTask1 = "ポモドーロテスト用タスク１";
    const pomodoroTargetTask2 = "ポモドーロテスト用タスク２";

    test.beforeEach(async () => {
      await resetDataBase();
    });

    test("タスク登録の後、ポモドーロタイマーが表示し、開始・終了すること", async ({
      page,
    }) => {
      await test.step("タスク1を登録する", async () => {
        await page.goto("/dashboard");
        await dashboardPage.clickAddTaskButton();
        await newTaskFormPage.fillTitle(pomodoroTargetTask1);
        await newTaskFormPage.clickSubmit();
        await dashboardPage.verifyTaskVisible(pomodoroTargetTask1);
      });

      await test.step("タスク1を選択し、ポモドーロタイマーが表示されていること", async () => {
        await dashboardPage.clickTask(pomodoroTargetTask1);
        await dashboardPage.verifyPomodoroVisible();
        await dashboardPage.verifyStartButtonEnabled();
        await dashboardPage.verifyTimerDisplay("25");
      });

      await test.step("ポモドーロタイマーが開始されること", async () => {
        await dashboardPage.clickStartButton();
        await expect(page.getByText("25:00")).not.toBeVisible();
        await dashboardPage.verifyStopButtonEnabled();
      });

      await page.waitForTimeout(2000);

      await test.step("ポモドーロタイマーが停止されること", async () => {
        await dashboardPage.clickStopButton();
        await dashboardPage.verifyStartButtonEnabled();
        await dashboardPage.verifyTimerDisplay("25");
      });
    });

    test("ポモドーロタイマー実行中に別のタスクを選択すると、確認画面が表示し、タスクを切り替えられること", async ({
      page,
    }) => {
      await test.step("タスク1を登録する", async () => {
        await page.goto("/dashboard");
        await dashboardPage.clickAddTaskButton();
        await newTaskFormPage.fillTitle(pomodoroTargetTask1);
        await newTaskFormPage.clickSubmit();
        await dashboardPage.verifyTaskVisible(pomodoroTargetTask1);
      });

      await test.step("タスク2を登録する", async () => {
        await page.goto("/dashboard");
        await dashboardPage.clickAddTaskButton();
        await newTaskFormPage.fillTitle(pomodoroTargetTask2);
        await newTaskFormPage.clickSubmit();
        await dashboardPage.verifyTaskVisible(pomodoroTargetTask2);
      });

      await test.step("タスク１のポモドーロタイマーが開始し、タスク２を選択し、タスク切り替え確認ダイアログが表示されること", async () => {
        await dashboardPage.clickTask(pomodoroTargetTask1);
        await dashboardPage.clickStartButton();
        await dashboardPage.clickTask(pomodoroTargetTask2);
        await dashboardPage.verifyConfirmDialogVisible();
      });

      await test.step("タスク切り替え確認ダイアログで「切り替える」ボタンをクリックし、タスク２にポモドーロタイマーが表示される", async () => {
        await dashboardPage.clickSwitchButton();
        await dashboardPage.verifyPomodoroTask(pomodoroTargetTask2);
      });
      // ブラウザ上で結果を確認するために設定
      await page.waitForTimeout(2000);
    });
  });

  // --- ナビゲーション ---
  test.describe("ナビゲーション", () => {
    test("ダッシュボードからタスク一覧ページに遷移できること", async ({
      page,
    }) => {
      await test.step("ダッシュボードを表示する", async () => {
        await page.goto("/dashboard");
        await dashboardPage.verifyPageLoaded();
      });

      await test.step("タスク一覧リンクをクリックする", async () => {
        await dashboardPage.clickTasksNavLink();
      });

      await test.step("タスク一覧ページに遷移していること", async () => {
        await dashboardPage.expectUrlContains("/tasks");
      });
    });

    test("タスク一覧ページからダッシュボードに戻れること", async ({ page }) => {
      await test.step("タスク一覧ページを表示する", async () => {
        await page.goto("/tasks");
      });

      await test.step("ダッシュボードリンクをクリックする", async () => {
        await dashboardPage.clickDashboardNavLink();
      });

      await test.step("ダッシュボードに遷移していること", async () => {
        await dashboardPage.expectUrlContains("/dashboard");
        await dashboardPage.verifyPageLoaded();
      });
    });
  });
});
