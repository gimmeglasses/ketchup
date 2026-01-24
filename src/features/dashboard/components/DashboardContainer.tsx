"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
// import Link from "next/link";
import Pomodoro, {
  type PomodoroHandle,
} from "@/features/dashboard/components/Pomodoro";
import { ConfirmDialog } from "@/features/pomodoro/components/ConfirmDialog";
import { type Task } from "@/features/tasks/types";
import { ModalContainer } from "@/features/tasks/components/ModalContainer";
import { NewTaskForm } from "@/features/tasks/components/newTaskForm";
import { EditTaskForm } from "@/features/tasks/components/EditTaskForm";
import { dayjs } from "@/lib/dayjs";
import { FaCheckCircle } from "react-icons/fa";
import { FcEditImage } from "react-icons/fc";
import { completeTaskAction } from "@/features/tasks/actions/completeTaskAction";
import { toast } from "sonner";

const DashboardContainer = ({
  tasks,
  pomodoroMinutes,
}: {
  tasks: Task[];
  pomodoroMinutes: Record<string, number>;
}) => {
  const formatDueDate = (dueAt: string | null): string => {
    if (!dueAt) return "-";
    return dayjs(dueAt).format("YYYY/MM/DD");
  };

  const formatEstimatedMinutes = (estimatedMinutes: number | null): string => {
    if (!estimatedMinutes) return "-";
    return `${estimatedMinutes} 分`;
  };

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);
  const pomodoroRef = useRef<PomodoroHandle>(null);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  // タスク登録後にモーダルを閉じて画面を更新
  const handleTaskActionSuccess = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setModalType(null);
    router.refresh();
  };

  // モーダルを閉じる処理
  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setModalType(null);
  };

  return (
    <>
      {/* Display "New task entry" button */}
      <div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setModalType("new");
          }}
          className="flex w-full justify-center rounded-lg bg-red-600
              font-semibold text-white shadow-md shadow-gray-400
              transition hover:-translate-y-0.5 hover:bg-gray-700 mb-4"
        >
          タスク追加
        </button>
      </div>

      {/* モーダルの配置 */}
      {isModalOpen && modalType === "new" && (
        <ModalContainer isOpen={isModalOpen} onClose={handleClose}>
          <NewTaskForm
            onSuccess={handleTaskActionSuccess}
            onClose={handleClose}
          />
        </ModalContainer>
      )}

      {isModalOpen && modalType === "edit" && editingTask && (
        <ModalContainer isOpen={isModalOpen} onClose={handleClose}>
          <EditTaskForm
            onSuccess={handleTaskActionSuccess}
            onClose={handleClose}
            task={editingTask}
          />
        </ModalContainer>
      )}

      {/* Dynamically display a selected task for using Pomodoro timer */}
      {selectedTask && (
        <Pomodoro
          ref={pomodoroRef}
          task={selectedTask}
          actualMinutes={pomodoroMinutes[selectedTask.id] ?? 0}
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

      {/* エラーメッセージの表示 */}
      {completeError && (
        <div
          className="mt-4 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center"
          role="alert"
        >
          <span>{completeError}</span>
          <button
            onClick={() => setCompleteError(null)}
            className="text-red-500 hover:text-red-700 font-bold px-2"
            aria-label="エラーメッセージを閉じる"
          >
            ×
          </button>
        </div>
      )}

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
              {/* 完了ボタン */}
              <div className="flex-none" onClick={(e) => e.stopPropagation()}>
                <button
                  disabled={isTimerRunning} // ★ ここで制御 (タイマー実行中は押せない)
                  title="完了"
                  aria-label="タスクを完了する"
                  className={`flex items-center justify-center transition-colors
                                ${
                                  isTimerRunning
                                    ? "text-gray-300 cursor-not-allowed" // ポモドーロタイマー起動中は無効にする
                                    : "text-gray-400 hover:text-green-500 cursor-pointer" // ポモドーロタイマー停止中は有効にする
                                }
                              `}
                  onClick={async () => {
                    const result = await completeTaskAction(task.id);
                    if (!result.success && result.errors?._form) {
                      setCompleteError(result.errors._form[0]);
                    } else {
                      setCompleteError(null);
                      // ポモドーロコンポーネントに表示されているタスクの場合、コンポーネントを閉じる
                      if (selectedTask?.id === task.id) {
                        setSelectedTask(null);
                      }
                    }
                  }}
                >
                  <FaCheckCircle size={25} />
                </button>
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
                <span>期限: {formatDueDate(task.dueAt)}</span>
                <span>
                  予定: {formatEstimatedMinutes(task.estimatedMinutes)} / 実績:{" "}
                  {pomodoroMinutes[task.id] ?? 0} 分
                </span>
              </div>
              {/* 編集ボタン */}
              <div className="flex-none ml-auto mt-1">
                <button
                  disabled={isTimerRunning}
                  title="編集"
                  aria-label="タスクを編集する"
                  className="flex items-center justify-center transition-colors hover:underline rounded p-1"
                  onClick={(event) => {
                    event.stopPropagation();
                    setEditingTask(task);
                    setIsModalOpen(true);
                    setModalType("edit");
                  }}
                >
                  <FcEditImage size={40} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DashboardContainer;
