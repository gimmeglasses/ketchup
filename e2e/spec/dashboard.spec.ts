import { test, expect, WorkerInfo } from "@playwright/test";
import { resetTaskData } from "../db/task-data.reset";
import { DashboardPage } from "../page/dashboard-page";
import { NewTaskModal } from "../component/new-task-modal";
import { EditTaskModal } from "../component/edit-task-modal";
import { DeleteTaskModal } from "../component/delete-task-modal";

let dashboardPage: DashboardPage;
let newTaskModal: NewTaskModal;
let editTaskModal: EditTaskModal;
let deleteTaskModal: DeleteTaskModal;

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

const taskName3 = "洗濯";
const note3 = "洗濯機を回す。洗濯物を干す";

test.beforeEach(async ({ page }, workerInfo: WorkerInfo) => {
  await resetTaskData();
  dashboardPage = new DashboardPage(page);
  newTaskModal = new NewTaskModal(page);
  editTaskModal = new EditTaskModal(page);
  deleteTaskModal = new DeleteTaskModal(page);
  console.log(`Starting test in project: ${workerInfo.project.name}`);
});

// --- ページ表示 ---
test.describe("ページ表示", () => {
  test("ページが正しく読み込まれること", async ({ page }) => {
    await page.goto("/dashboard");
    await dashboardPage.verifyPageLoaded();
  });

  test("「今日のタスク」見出しが表示されること", async ({ page }) => {
    await page.goto("/dashboard");
    await dashboardPage.waitForVisible(dashboardPage.getTodayTasksHeading());
  });

  test("タスク追加ボタンが表示されること", async ({ page }) => {
    await page.goto("/dashboard");
    await dashboardPage.waitForVisible(dashboardPage.getAddTaskButton());
  });

  test("ナビゲーションが表示されること", async ({ page }) => {
    await page.goto("/dashboard");
    await dashboardPage.waitForVisible(dashboardPage.getNav());
  });

  test("ダッシュボードリンクが表示されること", async ({ page }) => {
    await page.goto("/dashboard");
    await dashboardPage.waitForVisible(dashboardPage.getDashboardNavLink());
  });

  test("タスク一覧リンクが表示されること", async ({ page }) => {
    await page.goto("/dashboard");
    await dashboardPage.waitForVisible(dashboardPage.getTasksNavLink());
  });
});

// --- タスク登録 ---
test.describe("タスク登録", () => {
  test("タスク登録フォームの開閉ができること", async ({ page }) => {
    await test.step("タスク追加フォームを開く", async () => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.verifyFormVisible();
    });

    await test.step("タスク追加フォームを閉じる", async () => {
      await newTaskModal.clickClose();
      await newTaskModal.verifyFormClosed();
    });
  });

  test.describe("フォーム表示", () => {
    test("タスク名入力欄が表示されること", async ({ page }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.waitForVisible(newTaskModal.getTitleInput());
    });

    test("タスクの説明入力欄が表示されること", async ({ page }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.waitForVisible(newTaskModal.getNoteTextarea());
    });

    test("期限入力欄が表示されること", async ({ page }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.waitForVisible(newTaskModal.getDueAtInput());
    });

    test("予定（分）入力欄が表示されること", async ({ page }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.waitForVisible(
        newTaskModal.getEstimatedMinutesInput(),
      );
    });

    test("登録するボタンが表示されること", async ({ page }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.waitForVisible(newTaskModal.getSubmitButton());
    });

    test("閉じるボタンが表示されること", async ({ page }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.waitForVisible(newTaskModal.getCloseButton());
    });
  });

  test.describe("フォーム入力", () => {
    test("タスク名を入力できること", async ({ page }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(taskName1);
      await expect(newTaskModal.getTitleInput()).toHaveValue(taskName1);
    });

    test("タスクの説明を入力できること", async ({ page }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillNote(note1);
      await expect(newTaskModal.getNoteTextarea()).toHaveValue(note1);
    });

    test("期限を入力できること", async ({ page }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillDueAt(dueAt1);
      await expect(newTaskModal.getDueAtInput()).toHaveValue(dueAt1);
    });

    test("予定（分）を入力できること", async ({ page }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillEstimatedMinutes(estimatedMinutes1);
      await expect(newTaskModal.getEstimatedMinutesInput()).toHaveValue(
        estimatedMinutes1,
      );
    });
  });

  test("タスク登録の後、ダッシュボード画面にタスクが一覧表示されていること", async ({
    page,
  }) => {
    await test.step("タスク1を登録する", async () => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(taskName1);
      await newTaskModal.fillNote(note1);
      await newTaskModal.fillDueAt(dueAt1);
      await newTaskModal.fillEstimatedMinutes(estimatedMinutes1);
      await newTaskModal.clickSubmit();
    });

    await test.step("タスク1が一覧表示されていること", async () => {
      await dashboardPage.verifyTaskVisible(taskName1);
    });

    await test.step("タスク2を登録する", async () => {
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(taskName2);
      await newTaskModal.fillNote(note2);
      await newTaskModal.fillDueAt(dueAt2);
      await newTaskModal.fillEstimatedMinutes(estimatedMinutes2);
      await newTaskModal.clickSubmit();
    });

    await test.step("タスク2が一覧表示されていること", async () => {
      await dashboardPage.verifyTaskVisible(taskName2);
    });

    await test.step("タスク3を登録する", async () => {
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(taskName3);
      await newTaskModal.fillNote(note3);
      await newTaskModal.clickSubmit();
    });

    await test.step("タスク3が一覧表示されていること", async () => {
      await dashboardPage.verifyTaskVisible(taskName3);
    });

    await test.step("3つのタスクが一覧に表示されていること", async () => {
      expect(await dashboardPage.getTaskCount()).toBe(3);
    });
  });
});

// --- タスク編集 ---
test.describe("タスク編集", () => {
  const beforeEditTask = "編集テスト用タスク（Before）";
  const afterEditTask = "編集テスト用タスク（After）";

  test("タスク編集フォームの開閉ができること", async ({ page }) => {
    await test.step("タスクを登録する", async () => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(beforeEditTask);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(beforeEditTask);
    });

    await test.step("編集フォームを開く", async () => {
      await dashboardPage.clickEditButton(0);
      await editTaskModal.verifyFormVisible();
    });

    await test.step("編集フォームを閉じる", async () => {
      await editTaskModal.clickClose();
      await editTaskModal.verifyFormClosed();
    });
  });

  test.describe("フォーム表示", () => {
    test("編集フォーム表示確認：タスク名、更新するボタン、削除するボタン、閉じるボタンが設定されていること", async ({
      page,
    }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(beforeEditTask);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(beforeEditTask);
      await dashboardPage.clickEditButton(0);
      await editTaskModal.verifyFormVisible();
      await expect(editTaskModal.getTitleInput()).toHaveValue(beforeEditTask);
      await editTaskModal.waitForVisible(editTaskModal.getUpdateButton());
      await editTaskModal.waitForVisible(editTaskModal.getDeleteButton());
      await editTaskModal.waitForVisible(editTaskModal.getCloseButton());
    });
  });

  test("タスク編集の後、ダッシュボード画面に変更後のタスクが表示されていること", async ({
    page,
  }) => {
    await test.step("タスクを登録する", async () => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(beforeEditTask);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(beforeEditTask);
    });

    await test.step("編集フォームを開く", async () => {
      await dashboardPage.clickEditButton(0);
      await editTaskModal.verifyFormVisible();
    });

    await test.step("タスク名を変更して更新する", async () => {
      await editTaskModal.fillTitle(afterEditTask);
      await editTaskModal.clickUpdate();
    });

    await test.step("変更後のタスクが一覧に表示されていること", async () => {
      await dashboardPage.verifyTaskVisible(afterEditTask);
    });
  });
});

// --- タスク削除 ---
test.describe("タスク削除", () => {
  const deleteTargetTask = "削除テスト用タスク";

  test.describe("フォーム表示", () => {
    test("タスク削除画面表示確認：削除確認メッセージ、削除対象のタスク名、削除ボタン、キャンセルボタンが表示されること/", async ({
      page,
    }) => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(deleteTargetTask);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(deleteTargetTask);
      await dashboardPage.clickEditButton(0);
      await editTaskModal.verifyFormVisible();
      await editTaskModal.clickDelete();
      await deleteTaskModal.verifyFormVisible();
      await deleteTaskModal.verifyTaskTitle(deleteTargetTask);
      await deleteTaskModal.waitForVisible(deleteTaskModal.getDeleteButton());
      await deleteTaskModal.waitForVisible(deleteTaskModal.getCancelButton());
    });
  });

  test("タスク削除の後、ダッシュボード画面からタスクが消えていること", async ({
    page,
  }) => {
    await test.step("タスクを登録する", async () => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(deleteTargetTask);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(deleteTargetTask);
    });

    await test.step("編集フォームから削除ボタンを押す", async () => {
      await dashboardPage.clickEditButton(0);
      await editTaskModal.verifyFormVisible();
      await editTaskModal.clickDelete();
    });

    await test.step("削除確認ダイアログが表示されること", async () => {
      await deleteTaskModal.verifyFormVisible();
      await deleteTaskModal.verifyTaskTitle(deleteTargetTask);
    });

    await test.step("削除を実行する", async () => {
      await deleteTaskModal.clickDelete();
    });

    await test.step("タスクが一覧から消えていること", async () => {
      await expect(
        page.getByText(deleteTargetTask, { exact: true }),
      ).not.toBeVisible();
    });
  });

  test("削除確認ダイアログでキャンセルするとタスクが残ること", async ({
    page,
  }) => {
    await test.step("タスクを登録する", async () => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(deleteTargetTask);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(deleteTargetTask);
    });

    await test.step("編集フォームから削除ボタンを押す", async () => {
      await dashboardPage.clickEditButton(0);
      await editTaskModal.verifyFormVisible();
      await editTaskModal.clickDelete();
    });

    await test.step("キャンセルする", async () => {
      await deleteTaskModal.verifyFormVisible();
      await deleteTaskModal.clickCancel();
    });

    await test.step("編集フォームを閉じる", async () => {
      await editTaskModal.clickClose();
    });

    await test.step("タスクが一覧に残っていること", async () => {
      await dashboardPage.verifyTaskVisible(deleteTargetTask);
    });
  });
});

// --- タスク完了 ---
test.describe("タスク完了", () => {
  const completeTargetTask = "完了テスト用タスク";
  test("タスクを完了すると、ダッシュボード画面から消えること", async ({
    page,
  }) => {
    await test.step("タスクを登録する", async () => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(completeTargetTask);
      await newTaskModal.clickSubmit();
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
  });
});

// --- ポモドーロタイマー実行 ---
test.describe("ポモドーロタイマー実行", () => {
  const pomodoroTargetTask1 = "ポモドーロテスト用タスク１";
  const pomodoroTargetTask2 = "ポモドーロテスト用タスク２";
  test("タスク登録の後、ポモドーロタイマーが表示し、開始・終了すること", async ({
    page,
  }) => {
    await test.step("タスク1を登録する", async () => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(pomodoroTargetTask1);
      await newTaskModal.clickSubmit();
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
      await newTaskModal.fillTitle(pomodoroTargetTask1);
      await newTaskModal.clickSubmit();
      await dashboardPage.verifyTaskVisible(pomodoroTargetTask1);
    });

    await test.step("タスク2を登録する", async () => {
      await page.goto("/dashboard");
      await dashboardPage.clickAddTaskButton();
      await newTaskModal.fillTitle(pomodoroTargetTask2);
      await newTaskModal.clickSubmit();
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
