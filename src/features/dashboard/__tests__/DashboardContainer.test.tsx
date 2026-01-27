import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardContainer from "../components/DashboardContainer";
import { Task } from "@/features/tasks/types";

// モック化
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../components/Pomodoro", () => ({
  default: ({ task }: { task: Task }) => (
    <div data-testid="pomodoro-component">Pomodoro: {task.title}</div>
  ),
}));

// Test case
describe("DashboardContainer", () => {
  const mockTasksData = [
    {
      id: "ID0000000001TASK",
      profileId: "profile1",
      title: "タスク1",
      dueAt: "2030-01-10",
      estimatedMinutes: 120,
      completedAt: null,
      note: null,
      createdAt: "2030-01-01T00:00:00Z",
    },
    {
      id: "ID0000000002TASK",
      profileId: "profile1",
      title: "タスク2",
      dueAt: "2030-01-15",
      estimatedMinutes: 45,
      completedAt: null,
      note: null,
      createdAt: "2030-01-01T00:00:00Z",
    },
    {
      id: "ID0000000003TASK",
      profileId: "profile1",
      title: "タスク3",
      dueAt: "2030-01-03",
      estimatedMinutes: 90,
      completedAt: "2030-01-02T10:00:00Z",
      note: null,
      createdAt: "2030-01-01T00:00:00Z",
    },
  ];
  const mockTasks = mockTasksData.filter((task) => task.completedAt === null);

  describe("初期状態", () => {
    it("空のタスク配列のときリストが表示されない", () => {
      render(<DashboardContainer tasks={[]} pomodoroMinutes={{}} />);
      expect(screen.queryByText("タスク1")).not.toBeInTheDocument();
      expect(screen.queryByText("タスク2")).not.toBeInTheDocument();
      expect(screen.queryByText("タスク3")).not.toBeInTheDocument();
    });

    it("tasksのみ表示される", () => {
      render(<DashboardContainer tasks={mockTasks} pomodoroMinutes={{}} />);
      expect(screen.getByText("タスク1")).toBeInTheDocument();
      expect(screen.getByText("タスク2")).toBeInTheDocument();
      expect(screen.queryByText("タスク3")).not.toBeInTheDocument();
    });

    it("selectedTaskの初期値がnullでPomodoroが表示されない", () => {
      render(<DashboardContainer tasks={mockTasks} pomodoroMinutes={{}} />);
      expect(
        screen.queryByTestId("pomodoro-component"),
      ).not.toBeInTheDocument();
    });
  });

  describe("タスク選択機能", () => {
    it("タスク項目をクリックするとPomodoroコンポーネントが表示される", async () => {
      render(<DashboardContainer tasks={mockTasks} pomodoroMinutes={{}} />);
      const taskItem = screen.getByText("タスク1").closest("div");

      if (taskItem) {
        fireEvent.click(taskItem);
      }

      await waitFor(() => {
        expect(screen.getByTestId("pomodoro-component")).toBeInTheDocument();
      });
      expect(screen.getByText("Pomodoro: タスク1")).toBeInTheDocument();
    });

    it("別のタスクをクリックすると、選択タスクが切り替わる", () => {
      render(<DashboardContainer tasks={mockTasks} pomodoroMinutes={{}} />);

      const task1Item = screen.getByText("タスク1").closest("div");
      const task2Item = screen.getByText("タスク2").closest("div");

      if (task1Item) {
        fireEvent.click(task1Item);
      }
      expect(screen.getByText("Pomodoro: タスク1")).toBeInTheDocument();

      if (task2Item) {
        fireEvent.click(task2Item);
      }
      expect(screen.getByText("Pomodoro: タスク2")).toBeInTheDocument();
    });
  });

  describe("UI要素", () => {
    it("複数タスクがあるとき、すべてリストで表示される", () => {
      render(<DashboardContainer tasks={mockTasks} pomodoroMinutes={{}} />);

      expect(screen.getByText("タスク1")).toBeInTheDocument();
      expect(screen.getByText("タスク2")).toBeInTheDocument();
    });
  });

  describe("ポモドーロ実績表示", () => {
    it("実績がある場合、正しい分数が表示されること", () => {
      const pomodoroMinutes = {
        ID0000000001TASK: 50,
        ID0000000002TASK: 125,
      };
      render(
        <DashboardContainer
          tasks={mockTasks}
          pomodoroMinutes={pomodoroMinutes}
        />,
      );

      expect(screen.getByText(/実績: 50 分/)).toBeInTheDocument();
      expect(screen.getByText(/実績: 125 分/)).toBeInTheDocument();
    });

    it("実績がない場合、0分が表示されること", () => {
      render(<DashboardContainer tasks={mockTasks} pomodoroMinutes={{}} />);

      // 実績が0のタスクは「実績: 0 分」と表示される
      const actualTexts = screen.getAllByText(/実績: 0 分/);
      expect(actualTexts.length).toBeGreaterThan(0);
    });

    it("一部のタスクのみ実績がある場合、正しく表示されること", () => {
      const pomodoroMinutes = {
        ID0000000001TASK: 30,
        // ID0000000002TASKは実績なし
      };
      render(
        <DashboardContainer
          tasks={mockTasks}
          pomodoroMinutes={pomodoroMinutes}
        />,
      );

      expect(screen.getByText(/実績: 30 分/)).toBeInTheDocument();
      expect(screen.getByText(/実績: 0 分/)).toBeInTheDocument();
    });
  });

  describe("日付と時間の表示フォーマット", () => {
    it("期限が設定されている場合、YYYY/MM/DD形式で表示される", () => {
      render(<DashboardContainer tasks={mockTasks} pomodoroMinutes={{}} />);
      expect(screen.getByText("📅 期限: 2030/01/10")).toBeInTheDocument();
      expect(screen.getByText("📅 期限: 2030/01/15")).toBeInTheDocument();
    });

    it("期限がnullの場合、'-'が表示される", () => {
      const tasksWithNullDueAt = [
        {
          id: "ID0000000004TASK",
          profileId: "profile1",
          title: "期限未設定タスク",
          dueAt: null,
          estimatedMinutes: 60,
          completedAt: null,
          note: null,
          createdAt: "2030-01-01T00:00:00Z",
        },
      ];
      render(
        <DashboardContainer tasks={tasksWithNullDueAt} pomodoroMinutes={{}} />,
      );
      expect(screen.getByText("📅 期限: -")).toBeInTheDocument();
    });

    it("予定時間が設定されている場合、'XX 分'形式で表示される", () => {
      render(<DashboardContainer tasks={mockTasks} pomodoroMinutes={{}} />);
      expect(screen.getByText(/予定: 120 分/)).toBeInTheDocument();
      expect(screen.getByText(/予定: 45 分/)).toBeInTheDocument();
    });

    it("予定時間がnullの場合、'-'が表示される", () => {
      const tasksWithNullEstimatedMinutes = [
        {
          id: "ID0000000005TASK",
          profileId: "profile1",
          title: "予定時間未設定タスク",
          dueAt: "2030-12-31",
          estimatedMinutes: null,
          completedAt: null,
          note: null,
          createdAt: "2030-01-01T00:00:00Z",
        },
      ];
      render(
        <DashboardContainer
          tasks={tasksWithNullEstimatedMinutes}
          pomodoroMinutes={{}}
        />,
      );
      expect(screen.getByText(/予定: -/)).toBeInTheDocument();
    });
  });
});
