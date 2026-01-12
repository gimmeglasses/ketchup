import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Pomodoro from "../components/Pomodoro";
import type { PomodoroButtonProps } from "../components/PomodoroButton";
import { Task } from "@/features/tasks/types";
import "@testing-library/jest-dom/vitest";

vi.mock("../components/PomodoroButton", () => ({
  default: ({ onClick, children }: PomodoroButtonProps) => (
    <button onClick={onClick} data-testid={`button-${children}`}>
      {children}
    </button>
  ),
}));

describe("Pomodoro", () => {
  const mockTask: Task = {
    id: "test-task-1",
    profileId: "test-profile-1",
    title: "テストタスク",
    dueAt: "2026-01-10",
    estimatedMinutes: 60,
    completedAt: null,
    note: null,
    createdAt: "2025-01-10T00:00:00Z",
  };

  describe("バリデーション・エラーハンドリング", () => {
    it("taskがnullのときnullをレンダリング", () => {
      const { container } = render(<Pomodoro task={null as unknown as Task} />);
      expect(container.firstChild).toBeNull();
    });

    it("task.idが存在しないときnullをレンダリング", () => {
      const invalidTask = { ...mockTask, id: undefined } as unknown as Task;
      const { container } = render(<Pomodoro task={invalidTask} />);
      expect(container.firstChild).toBeNull();
    });

    it("有効なタスクのときレンダリングされる", () => {
      render(<Pomodoro task={mockTask} />);
      expect(screen.getByText("テストタスク")).toBeInTheDocument();
    });
  });

  describe("タスク情報の表示", () => {
    it("タスク名が表示される", () => {
      render(<Pomodoro task={mockTask} />);
      expect(screen.getByText("テストタスク")).toBeInTheDocument();
    });

    it("見積時間がある場合、『X分』形式で表示される", () => {
      render(<Pomodoro task={mockTask} />);
      expect(screen.getByText(/予定: 60 分/)).toBeInTheDocument();
    });

    it("見積時間がない場合、『None』と表示される", () => {
      const taskWithoutEstimate = { ...mockTask, estimatedMinutes: null };
      render(<Pomodoro task={taskWithoutEstimate} />);
      expect(
        screen.getByText(
          (content) => content.includes("予定:") && content.includes("None")
        )
      ).toBeInTheDocument();
    });

    it("常に『25:00』と表示される", () => {
      render(<Pomodoro task={mockTask} />);
      expect(screen.getByText("25:00")).toBeInTheDocument();
    });
  });

  describe("ボタン操作", () => {
    it("STARTボタンが表示される", () => {
      render(<Pomodoro task={mockTask} />);
      const startButton = screen.getByTestId("button-START");
      expect(startButton).toBeInTheDocument();
    });

    it("STOPボタンが表示される", () => {
      render(<Pomodoro task={mockTask} />);
      const stopButton = screen.getByTestId("button-STOP");
      expect(stopButton).toBeInTheDocument();
    });
  });
});
