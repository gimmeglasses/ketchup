"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
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
  onTimerStateChange?: (isRunning: boolean) => void;
};

export type PomodoroHandle = {
  stopTimer: () => Promise<void>;
};

const Pomodoro = forwardRef<PomodoroHandle, PomodoroProps>(function Pomodoro(
  { task, onTimerStateChange },
  ref
) {
  const [session, setSession] = useState<PomodoroSession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(
    WORK_DURATION_SECONDS
  );
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>("idle");
  const isCompletingRef = useRef(false);

  function extractErrorMessage(
    errors: Record<string, string[] | undefined>,
    fallback: string
  ): string {
    return errors._form?.[0] || Object.values(errors).flat()[0] || fallback;
  }

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

    if (timerMode === "work") {
      // 作業タイマー完了 → 休憩開始
      toast.success("お疲れ様！5分休憩スタート 🎉");

      // セッションをDBに記録
      if (session) {
        const formData = new FormData();
        formData.append("sessionId", session.id);
        await stopPomodoroAction({ success: false, errors: {} }, formData);
        setSession(null);
      }

      // 休憩タイマーに切り替え
      setTimerMode("break");
      setRemainingSeconds(BREAK_DURATION_SECONDS);
      // isRunningはtrueのまま
    } else if (timerMode === "break") {
      // 休憩タイマー完了 → 停止
      toast.success("休憩終了！次のポモドーロへ 💪");

      setTimerMode("idle");
      setIsRunning(false);
      setRemainingSeconds(WORK_DURATION_SECONDS);
    }

    isCompletingRef.current = false;
  }, [timerMode, session]);

  async function handleStartButton(): Promise<void> {
    const formData = new FormData();
    formData.append("taskId", task.id);
    const result = await startPomodoroAction(
      { success: false, errors: {} },
      formData
    );

    if (result.success) {
      setSession(result.session);
      setTimerMode("work");
      setRemainingSeconds(WORK_DURATION_SECONDS);
      setIsRunning(true);
    } else {
      alert(
        extractErrorMessage(result.errors, "セッションの開始に失敗しました")
      );
    }
  }

  async function handleStopButton(): Promise<void> {
    // 作業中の場合のみDBに記録
    if (timerMode === "work" && session) {
      const formData = new FormData();
      formData.append("sessionId", session.id);
      const result = await stopPomodoroAction(
        { success: false, errors: {} },
        formData
      );

      if (!result.success) {
        alert(
          extractErrorMessage(result.errors, "セッションの停止に失敗しました")
        );
        return;
      }
    }

    // 状態をリセット
    setSession(null);
    setTimerMode("idle");
    setRemainingSeconds(WORK_DURATION_SECONDS);
    setIsRunning(false);
  }

  useImperativeHandle(ref, () => ({
    stopTimer: handleStopButton,
  }));

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && remainingSeconds === 0) {
      handleTimerComplete();
    }
  }, [isRunning, remainingSeconds, handleTimerComplete]);

  useEffect(() => {
    onTimerStateChange?.(isRunning);
  }, [isRunning, onTimerStateChange]);

  if (!task?.id) {
    return null;
  }

  const modeConfig = TIMER_MODE_CONFIG[timerMode];
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
            <span>予定: {estimatedDisplay} / 実績: XX 分</span>
          </div>
        </div>
        <div className="p-2 sm:p-3 flex flex-col gap-2 sm:gap-3">
          <div
            className={`flex mx-auto text-5xl font-extralight ${modeConfig.textClass}`}
          >
            {formatTime(remainingSeconds)}
          </div>
          <div className="flex mx-auto gap-3 sm:gap-6">
            <PomodoroButton onClick={handleStartButton} disabled={isRunning}>
              START
            </PomodoroButton>
            <PomodoroButton onClick={handleStopButton} disabled={!isRunning}>
              STOP
            </PomodoroButton>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Pomodoro;
