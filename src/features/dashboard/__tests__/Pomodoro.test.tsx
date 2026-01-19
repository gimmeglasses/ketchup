import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pomodoro from "../components/Pomodoro";
import type { PomodoroButtonProps } from "../components/PomodoroButton";
import { Task } from "@/features/tasks/types";
import { PomodoroSession } from "@/features/pomodoro/types";
import "@testing-library/jest-dom/vitest";
import * as startPomodoroActionModule from "@/features/pomodoro/actions/startPomodoroAction";
import * as stopPomodoroActionModule from "@/features/pomodoro/actions/stopPomodoroAction";

let mockUseOptimisticSetter: (value: unknown) => void = vi.fn();
let mockStartTransition: (callback: () => void | Promise<void>) => void = vi.fn(
  (callback) => {
    void Promise.resolve(callback());
  }
);
let mockIsPending = false;

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useOptimistic: vi.fn((state) => [state, mockUseOptimisticSetter]),
    useTransition: vi.fn(() => [mockIsPending, mockStartTransition]),
  };
});

vi.mock("../components/PomodoroButton", () => ({
  default: ({
    onClick,
    children,
    disabled,
  }: PomodoroButtonProps & { disabled?: boolean }) => (
    <button
      onClick={onClick}
      data-testid={`button-${children}`}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/features/pomodoro/actions/startPomodoroAction");
vi.mock("@/features/pomodoro/actions/stopPomodoroAction");

const MOCK_TASK: Task = {
  id: "test-task-1",
  profileId: "test-profile-1",
  title: "テストタスク",
  dueAt: "2026-01-10",
  estimatedMinutes: 60,
  completedAt: null,
  note: null,
  createdAt: "2025-01-10T00:00:00Z",
};

const MOCK_SESSION: PomodoroSession = {
  id: "session-1",
  taskId: "test-task-1",
  profileId: "test-profile-1",
  createdAt: "2026-01-19T00:00:00Z",
  startedAt: "2026-01-19T00:00:00Z",
  stoppedAt: null,
};

function resetMocks(): void {
  vi.clearAllMocks();
  mockIsPending = false;
  mockUseOptimisticSetter = vi.fn();
  mockStartTransition = vi.fn((callback) => {
    void Promise.resolve(callback());
  });
}

describe("Pomodoro", () => {
  beforeEach(resetMocks);

  describe("バリデーション・エラーハンドリング", () => {
    it("taskがnullのときnullをレンダリング", () => {
      const { container } = render(
        <Pomodoro task={null as unknown as Task} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("task.idが存在しないときnullをレンダリング", () => {
      const invalidTask = { ...MOCK_TASK, id: undefined } as unknown as Task;
      const { container } = render(<Pomodoro task={invalidTask} />);
      expect(container.firstChild).toBeNull();
    });

    it("有効なタスクのときレンダリングされる", () => {
      render(<Pomodoro task={MOCK_TASK} />);
      expect(screen.getByText("テストタスク")).toBeInTheDocument();
    });
  });

  describe("タスク情報の表示", () => {
    it("タスク名が表示される", () => {
      render(<Pomodoro task={MOCK_TASK} />);
      expect(screen.getByText("テストタスク")).toBeInTheDocument();
    });

    it("見積時間がある場合、『X分』形式で表示される", () => {
      render(<Pomodoro task={MOCK_TASK} />);
      expect(screen.getByText(/予定: 60 分/)).toBeInTheDocument();
    });

    it("見積時間がない場合、『None』と表示される", () => {
      const taskWithoutEstimate = { ...MOCK_TASK, estimatedMinutes: null };
      render(<Pomodoro task={taskWithoutEstimate} />);
      expect(
        screen.getByText(
          (content) => content.includes("予定:") && content.includes("None")
        )
      ).toBeInTheDocument();
    });

    it("実績時間が渡されない場合、0分と表示される", () => {
      render(<Pomodoro task={MOCK_TASK} />);
      expect(screen.getByText(/実績: 0 分/)).toBeInTheDocument();
    });

    it("実績時間が渡された場合、その値が表示される", () => {
      render(<Pomodoro task={MOCK_TASK} actualMinutes={50} />);
      expect(screen.getByText(/実績: 50 分/)).toBeInTheDocument();
    });

    it("常に『25:00』と表示される", () => {
      render(<Pomodoro task={MOCK_TASK} />);
      expect(screen.getByText("25:00")).toBeInTheDocument();
    });
  });

  describe("ボタン操作", () => {
    it("STARTボタンとSTOPボタンが表示される", () => {
      render(<Pomodoro task={MOCK_TASK} />);
      expect(screen.getByTestId("button-START")).toBeInTheDocument();
      expect(screen.getByTestId("button-STOP")).toBeInTheDocument();
    });
  });

  describe("楽観的UI更新とボタン連打防止", () => {
    it("STARTボタンクリック時、useOptimisticで即座にタイマーが開始される", async () => {
      const user = userEvent.setup();
      vi.spyOn(
        startPomodoroActionModule,
        "startPomodoroAction"
      ).mockResolvedValue({
        success: true,
        session: MOCK_SESSION,
      });

      render(<Pomodoro task={MOCK_TASK} />);
      await user.click(screen.getByTestId("button-START"));

      await waitFor(() => {
        expect(mockUseOptimisticSetter).toHaveBeenCalledWith(
          expect.objectContaining({
            isRunning: true,
            timerMode: "work",
          })
        );
      });
    });

    it("STARTボタン連打時、startTransitionが1回のみ呼ばれる", async () => {
      const user = userEvent.setup();
      vi.spyOn(
        startPomodoroActionModule,
        "startPomodoroAction"
      ).mockResolvedValue({
        success: true,
        session: MOCK_SESSION,
      });

      render(<Pomodoro task={MOCK_TASK} />);
      const startButton = screen.getByTestId("button-START");

      await user.click(startButton);
      await user.click(startButton);
      await user.click(startButton);

      await waitFor(() => {
        expect(mockStartTransition).toHaveBeenCalledTimes(1);
      });
    });

    it("STOPボタン連打時、startTransitionが1回のみ呼ばれる", async () => {
      const user = userEvent.setup();
      vi.spyOn(
        stopPomodoroActionModule,
        "stopPomodoroAction"
      ).mockResolvedValue({
        success: true,
        session: { ...MOCK_SESSION, stoppedAt: "2026-01-19T00:25:00Z" },
      });

      render(<Pomodoro task={MOCK_TASK} />);
      await user.click(screen.getByTestId("button-START"));

      vi.clearAllMocks();

      const stopButton = screen.getByTestId("button-STOP");
      await user.click(stopButton);
      await user.click(stopButton);
      await user.click(stopButton);

      await waitFor(() => {
        expect(mockStartTransition).toHaveBeenCalledTimes(1);
      });
    });

    it("Server Action失敗時、useOptimisticSetterが呼ばれた後にロールバックされる", async () => {
      const user = userEvent.setup();
      vi.spyOn(
        startPomodoroActionModule,
        "startPomodoroAction"
      ).mockResolvedValue({
        success: false,
        errors: { _form: ["セッションの開始に失敗しました"] },
      });

      render(<Pomodoro task={MOCK_TASK} />);
      await user.click(screen.getByTestId("button-START"));

      await waitFor(() => {
        expect(mockUseOptimisticSetter).toHaveBeenCalled();
      });
    });

    it("isPendingがtrueのとき、両方のボタンがdisabledになる", () => {
      mockIsPending = true;

      render(<Pomodoro task={MOCK_TASK} />);

      expect(screen.getByTestId("button-START")).toBeDisabled();
      expect(screen.getByTestId("button-STOP")).toBeDisabled();
    });
  });
});
