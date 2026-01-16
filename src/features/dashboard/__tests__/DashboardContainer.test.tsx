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
      dueAt: "2026-01-10",
      estimatedMinutes: 120,
      completedAt: null,
      note: null,
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "ID0000000002TASK",
      profileId: "profile1",
      title: "タスク2",
      dueAt: "2026-01-15",
      estimatedMinutes: 45,
      completedAt: null,
      note: null,
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "ID0000000003TASK",
      profileId: "profile1",
      title: "タスク3",
      dueAt: "2026-01-03",
      estimatedMinutes: 90,
      completedAt: "2026-01-02T10:00:00Z",
      note: null,
      createdAt: "2026-01-01T00:00:00Z",
    },
  ];
  const mockTasks = mockTasksData.filter((task) => task.completedAt === null);

  describe("初期状態", () => {
    it("空のタスク配列のときリストが表示されない", () => {
      render(<DashboardContainer tasks={[]} />);
      expect(screen.queryByText("タスク1")).not.toBeInTheDocument();
      expect(screen.queryByText("タスク2")).not.toBeInTheDocument();
      expect(screen.queryByText("タスク3")).not.toBeInTheDocument();
      expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    });

    it("tasksのみ表示される", () => {
      render(<DashboardContainer tasks={mockTasks} />);
      expect(screen.getByText("タスク1")).toBeInTheDocument();
      expect(screen.getByText("タスク2")).toBeInTheDocument();
      expect(screen.queryByText("タスク3")).not.toBeInTheDocument();
      expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    });

    it("selectedTaskの初期値がnullでPomodoroが表示されない", () => {
      render(<DashboardContainer tasks={mockTasks} />);
      expect(
        screen.queryByTestId("pomodoro-component")
      ).not.toBeInTheDocument();
    });
  });

  describe("タスク選択機能", () => {
    it("タスク項目をクリックするとPomodoroコンポーネントが表示される", async () => {
      render(<DashboardContainer tasks={mockTasks} />);
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
      render(<DashboardContainer tasks={mockTasks} />);

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

  describe("チェックボックス管理", () => {
    it("チェックボックスをONにするとcheckedTasksが更新される", () => {
      render(<DashboardContainer tasks={mockTasks} />);
      const checkboxes = screen.getAllByRole("checkbox");

      fireEvent.click(checkboxes[0]);
      expect(checkboxes[0]).toBeChecked();
    });

    it("チェック状態が複数タスクで独立して管理される", () => {
      render(<DashboardContainer tasks={mockTasks} />);
      const checkboxes = screen.getAllByRole("checkbox");

      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });

    it("チェックボックス操作がタスク項目のclickイベントを発火させない", async () => {
      render(<DashboardContainer tasks={mockTasks} />);
      const checkboxes = screen.getAllByRole("checkbox");

      // onChange event
      fireEvent.change(checkboxes[0]);
      // Verify stopPropagation worked - Pomodoro should NOT appear
      expect(
        screen.queryByTestId("pomodoro-component")
      ).not.toBeInTheDocument();
    });
  });

  describe("UI要素", () => {
    it("「編集」ボタンが/tasks/[id]/editへのリンク", () => {
      render(<DashboardContainer tasks={mockTasks} />);
      const editButtons = screen.getAllByText("編集");

      // Use task IDs instead of indices
      expect(editButtons[0].getAttribute("href")).toBe(
        "/tasks/ID0000000001TASK/edit"
      );
      expect(editButtons[1].getAttribute("href")).toBe(
        "/tasks/ID0000000002TASK/edit"
      );
    });

    it("編集ボタンのclickイベントが親要素を発火させない", () => {
      render(<DashboardContainer tasks={mockTasks} />);
      const editButtons = screen.getAllByText("編集");

      // onClick event
      fireEvent.click(editButtons[0]);
      // Pomodoroが表示されていない = タスク項目のclickが発火していない
      expect(
        screen.queryByTestId("pomodoro-component")
      ).not.toBeInTheDocument();
    });

    it("複数タスクがあるとき、すべてリストで表示される", () => {
      render(<DashboardContainer tasks={mockTasks} />);

      expect(screen.getByText("タスク1")).toBeInTheDocument();
      expect(screen.getByText("タスク2")).toBeInTheDocument();
    });
  });
});
