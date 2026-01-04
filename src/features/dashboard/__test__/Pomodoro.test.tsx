// src/features/dashboard/__tests__/Pomodoro.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pomodoro from "../components/Pomodoro";
import { Task } from "@/types/task";
import "@testing-library/jest-dom/vitest";

vi.mock("../components/Button", () => ({
  default: ({ onClick, children }: any) => (
    <button onClick={onClick} data-testid={`button-${children}`}>
      {children}
    </button>
  ),
}));

describe("Pomodoro", () => {
  const mockTask: Task = {
    id: "test-task-1",
    name: "テストタスク",
    dueDate: "2026-01-10",
    estimatedMin: 60,
    completedAt: null,
  };

  describe("バリデーション・エラーハンドリング", () => {
    it("taskがnullのときnullをレンダリング", () => {
      const { container } = render(<Pomodoro task={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it("task.idが存在しないときnullをレンダリング", () => {
      const invalidTask = { ...mockTask, id: undefined } as any;
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
      const taskWithoutEstimate = { ...mockTask, estimatedMin: undefined };
      render(<Pomodoro task={taskWithoutEstimate} />);
      expect(screen.getByText(/予定: None/)).toBeInTheDocument();
    });

    it("常に『25:00』と表示される", () => {
      render(<Pomodoro task={mockTask} />);
      expect(screen.getByText("25:00")).toBeInTheDocument();
    });
  });

  describe("ボタン操作", () => {
    it("STARTボタンをクリックするとhandleStartButtonが呼ばれる", () => {
      const consoleSpy = vi.spyOn(console, "log");
      render(<Pomodoro task={mockTask} />);
      
      const startButton = screen.getByTestId("button-START");
      fireEvent.click(startButton);
      
      expect(consoleSpy).toHaveBeenCalledWith("Start button is clicked.");
      consoleSpy.mockRestore();
    });

    it("STOPボタンをクリックするとhandleStopButtonが呼ばれる", () => {
      const consoleSpy = vi.spyOn(console, "log");
      render(<Pomodoro task={mockTask} />);
      
      const stopButton = screen.getByTestId("button-STOP");
      fireEvent.click(stopButton);
      
      expect(consoleSpy).toHaveBeenCalledWith("Stop button is clicked.");
      consoleSpy.mockRestore();
    });
  });

  describe("memoの動作", () => {
    it("同じtaskで再レンダリングされない", () => {
      const { rerender } = render(<Pomodoro task={mockTask} />);
      const consoleSpy = vi.spyOn(console, "log");
      // Strict modeで動いているため、必ず２回レンダリングされるため、初回レンダリングの後、初期化する。
      consoleSpy.mockClear(); // Clear calls from initial render
      
      rerender(<Pomodoro task={mockTask} />);
      
      // 期待値：memoにより同じpropsでは再レンダリングされないため、
      // consolelogは呼ばれない
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("taskが変更されたときのみ再レンダリングされる", () => {
      const task2: Task = { ...mockTask, name: "別のタスク" };
      const { rerender } = render(<Pomodoro task={mockTask} />);
      
      rerender(<Pomodoro task={task2} />);
      
      expect(screen.getByText("別のタスク")).toBeInTheDocument();
    });
  });
});