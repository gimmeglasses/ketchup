"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { startPomodoroAction } from "@/features/pomodoro/actions/startPomodoroAction";
import { stopPomodoroAction } from "@/features/pomodoro/actions/stopPomodoroAction";
import { type PomodoroSession } from "@/features/pomodoro/types";
import { type Task } from "@/features/tasks/types";
import PomodoroButton from "./PomodoroButton";

const WORK_DURATION_SECONDS = 25 * 60;
const BREAK_DURATION_SECONDS = 5 * 60;

type TimerMode = "idle" | "work" | "break";

type TimerState = {
  isRunning: boolean;
  timerMode: TimerMode;
  remainingSeconds: number;
  session: PomodoroSession | null;
};

const INITIAL_TIMER_STATE: TimerState = {
  isRunning: false,
  timerMode: "idle",
  remainingSeconds: WORK_DURATION_SECONDS,
  session: null,
};

function extractErrorMessage(
  errors: Record<string, string[] | undefined>,
  fallback: string
): string {
  return errors._form?.[0] || Object.values(errors).flat()[0] || fallback;
}

const TIMER_MODE_CONFIG = {
  idle: {
    label: "ポモドーロタイマー",
    bgClass: "bg-gray-50 border-l-gray-400",
    textClass: "text-gray-600",
  },
  work: {
    label: "作業中",
    bgClass: "bg-red-50 border-l-red-600",
    textClass: "text-red-600",
  },
  break: {
    label: "休憩中",
    bgClass: "bg-green-50 border-l-green-600",
    textClass: "text-green-600",
  },
} as const;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

type PomodoroProps = {
  task: Task;
  actualMinutes?: number;
  onTimerStateChange?: (isRunning: boolean) => void;
};

export type PomodoroHandle = {
  stopTimer: () => void;
};

const Pomodoro = forwardRef<PomodoroHandle, PomodoroProps>(function Pomodoro(
  { task, actualMinutes = 0, onTimerStateChange },
  ref
) {
  const [timerState, setTimerState] = useState<TimerState>(INITIAL_TIMER_STATE);
  const [optimisticTimerState, setOptimisticTimerState] = useOptimistic(
    timerState,
    (_state: TimerState, newState: TimerState) => newState
  );
  const [isPending, startTransition] = useTransition();
  const isCompletingRef = useRef(false);

  const handleTimerComplete = useCallback(async () => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    const audio = new Audio("/sounds/alarm.mp3");

    await new Promise<void>((resolve) => {
      audio.addEventListener("playing", () => resolve(), { once: true });
      audio.play().catch((err) => {
        console.error("Failed to play sound:", err);
        resolve();
      });
      setTimeout(() => resolve(), 500);
    });

    if (optimisticTimerState.timerMode === "work") {
      toast.success("お疲れ様！5分休憩スタート 🎉");

      if (optimisticTimerState.session) {
        const formData = new FormData();
        formData.append("sessionId", optimisticTimerState.session.id);
        await stopPomodoroAction({ success: false, errors: {} }, formData);
      }

      setTimerState((prev) => ({
        ...prev,
        timerMode: "break",
        remainingSeconds: BREAK_DURATION_SECONDS,
        session: null,
      }));
    } else if (optimisticTimerState.timerMode === "break") {
      toast.success("休憩終了！次のポモドーロへ 💪");
      setTimerState(INITIAL_TIMER_STATE);
    }

    isCompletingRef.current = false;
  }, [optimisticTimerState]);

  function handleStartButton(): void {
    if (isPending || optimisticTimerState.isRunning) return;

    const optimisticWorkState: TimerState = {
      isRunning: true,
      timerMode: "work",
      remainingSeconds: WORK_DURATION_SECONDS,
      session: null,
    };

    startTransition(async () => {
      setOptimisticTimerState(optimisticWorkState);

      try {
        const formData = new FormData();
        formData.append("taskId", task.id);
        const result = await startPomodoroAction(
          { success: false, errors: {} },
          formData
        );

        if (result.success) {
          setTimerState({
            ...optimisticWorkState,
            session: result.session,
          });
        } else {
          toast.error(
            extractErrorMessage(result.errors, "セッションの開始に失敗しました")
          );
        }
      } catch (error) {
        console.error("Failed to start pomodoro session:", error);
        toast.error("セッションの開始に失敗しました");
      }
    });
  }

  function handleStopButton(): void {
    if (isPending || !optimisticTimerState.isRunning) return;

    const currentSession = optimisticTimerState.session;
    const currentMode = optimisticTimerState.timerMode;

    startTransition(async () => {
      setOptimisticTimerState(INITIAL_TIMER_STATE);

      try {
        if (currentMode === "work" && currentSession) {
          const formData = new FormData();
          formData.append("sessionId", currentSession.id);
          const result = await stopPomodoroAction(
            { success: false, errors: {} },
            formData
          );

          if (!result.success) {
            toast.error(
              extractErrorMessage(
                result.errors,
                "セッションの停止に失敗しました"
              )
            );
            return;
          }
        }

        setTimerState(INITIAL_TIMER_STATE);
      } catch (error) {
        console.error("Failed to stop pomodoro session:", error);
        toast.error("セッションの停止に失敗しました");
      }
    });
  }

  useImperativeHandle(ref, () => ({
    stopTimer: handleStopButton,
  }));

  useEffect(() => {
    if (!optimisticTimerState.isRunning) return;

    const interval = setInterval(() => {
      setTimerState((prev) => ({
        ...prev,
        remainingSeconds: Math.max(0, prev.remainingSeconds - 1),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [optimisticTimerState.isRunning]);

  useEffect(() => {
    if (
      optimisticTimerState.isRunning &&
      optimisticTimerState.remainingSeconds === 0
    ) {
      handleTimerComplete();
    }
  }, [
    optimisticTimerState.isRunning,
    optimisticTimerState.remainingSeconds,
    handleTimerComplete,
  ]);

  useEffect(() => {
    onTimerStateChange?.(optimisticTimerState.isRunning);
  }, [optimisticTimerState.isRunning, onTimerStateChange]);

  if (!task?.id) {
    return null;
  }

  const modeConfig = TIMER_MODE_CONFIG[optimisticTimerState.timerMode];
  const estimatedDisplay = task.estimatedMinutes
    ? `${task.estimatedMinutes} 分`
    : "None";

  return (
    <div className="flex flex-col rounded-lg border-white shadow-md shadow-gray-400 hover:bg-gray-700">
      <div className="p-3 border rounded-lg flex flex-col gap-3 bg-white">
        <h1 className="font-bold text-gray-500 text-sm">
          ポモドーロタイマーを使う
        </h1>
        <div
          className={`p-3 flex flex-col gap-3 border border-white border-l-4 rounded-lg ${modeConfig.bgClass}`}
        >
          <div className="flex items-center w-full">
            <div className="flex-1 min-w-0 px-2 text-gray-600">
              <span className="font-bold text-sm block">
                {modeConfig.label}
              </span>
              <span className="font-extrabold truncate block">
                {task.title}
              </span>
            </div>
          </div>
          <div className="flex flex-col ml-6 text-sm text-gray-700">
            <span>予定: {estimatedDisplay} / 実績: {actualMinutes} 分</span>
          </div>
        </div>
        <div className="p-2 sm:p-3 flex flex-col gap-2 sm:gap-3">
          <div
            className={`flex mx-auto text-5xl font-extralight ${modeConfig.textClass}`}
          >
            {formatTime(optimisticTimerState.remainingSeconds)}
          </div>
          <div className="flex mx-auto gap-3 sm:gap-6">
            <PomodoroButton
              onClick={handleStartButton}
              disabled={optimisticTimerState.isRunning || isPending}
            >
              START
            </PomodoroButton>
            <PomodoroButton
              onClick={handleStopButton}
              disabled={!optimisticTimerState.isRunning || isPending}
            >
              STOP
            </PomodoroButton>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Pomodoro;
