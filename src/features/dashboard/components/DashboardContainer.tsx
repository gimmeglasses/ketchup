"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Pomodoro, {
  type PomodoroHandle,
} from "@/features/dashboard/components/Pomodoro";
import { ConfirmDialog } from "@/features/pomodoro/components/ConfirmDialog";
import { type Task } from "@/features/tasks/types";

const DashboardContainer = ({ tasks }: { tasks: Task[] }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);
  const pomodoroRef = useRef<PomodoroHandle>(null);

  const handleClick = (task: Task) => {
    if (isTimerRunning && selectedTask?.id !== task.id) {
      // タイマー実行中で、別のタスクを選択した場合 → 警告ダイアログ
      setPendingTask(task);
      setShowConfirm(true);
    } else {
      // タイマー停止中、または同じタスクをクリックした場合 → 通常の切り替え
      setSelectedTask(task);
    }
  };

  const handleConfirmSwitch = async () => {
    if (pomodoroRef.current) {
      await pomodoroRef.current.stopTimer();
    }
    setSelectedTask(pendingTask);
    setPendingTask(null);
    setShowConfirm(false);
  };

  const handleCancelSwitch = () => {
    setPendingTask(null);
    setShowConfirm(false);
  };

  // チェックボックスがONになったタスクを格納。
  const [checkedTasks, setCheckedTasks] = useState<{ [id: string]: boolean }>(
    {}
  );
  const handleChecked = (
    taskId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskId]: event.target.checked,
    }));
  };

  return (
    <>
      {/* Display "New task entry" button */}
      <div>
        <Link
          href="/tasks/new"
          className="flex justify-center rounded-lg bg-red-600
              font-semibold text-white shadow-md shadow-gray-400
              transition hover:-translate-y-0.5 hover:bg-gray-700 mb-4"
        >
          タスク追加
        </Link>
      </div>

      {/* Dynamically display a selected task for using Pomodoro timer */}
      {selectedTask && (
        <Pomodoro
          ref={pomodoroRef}
          task={selectedTask}
          onTimerStateChange={setIsTimerRunning}
        />
      )}

      {/* Confirm dialog for task switching */}
      <ConfirmDialog
        open={showConfirm}
        message="タイマー実行中です。停止してから切り替えますか?"
        onConfirm={handleConfirmSwitch}
        onCancel={handleCancelSwitch}
      />

      {/* Display task list */}
      <div className="flex flex-col gap-4 mt-4 text-gray-600">
        <h1 className="text-xl sm:text-2xl font-bold">今日のタスク</h1>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-3 border rounded-lg border-white shadow-md shadow-gray-400 hover:bg-gray-300
              flex flex-col gap-3 bg-white"
            onClick={() => handleClick(task)}
          >
            <div className="flex items-center w-full">
              {/* チェックボックス*/}
              {/* 今後、削除機能またはタスク完了処理で利用（仮） */}
              <div className="flex-none" onClick={(e) => e.stopPropagation()}>
                <input
                  className="text-red-600 rounded focus:ring-red-500"
                  type="checkbox"
                  checked={checkedTasks[task.id] || false}
                  onChange={(event) => handleChecked(task.id, event)}
                />
              </div>

              {/* タスク名 */}
              <div className="flex-1 min-w-0 px-2">
                <span className="font-extrabold truncate block">
                  {task.title}
                </span>
              </div>
            </div>
            <div className="flex">
              {/* 残りの項目を縦に表示 */}
              <div className="flex flex-col ml-6 text-sm text-gray-600">
                <span>期限: {task.dueAt ? task.dueAt : "None"}</span>
                <span>
                  予定:{" "}
                  {task.estimatedMinutes
                    ? `${task.estimatedMinutes} 分`
                    : "None"}{" "}
                  / 実績: XX 分
                </span>
              </div>
              {/* 編集ボタン */}
              <div className="flex-none ml-auto mt-1">
                <Link
                  href={`/tasks/${task.id}/edit`}
                  className="font-bold text-xs text-white px-2 py-4 bg-red-600 hover:underline border rounded p-1"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  編集
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DashboardContainer;
