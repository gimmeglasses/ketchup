import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { completeTaskAction } from "@/features/tasks/actions/completeTaskAction";
import { type Task } from "@/features/tasks/types";

interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
}

const TaskItem = ({ task, onClick }: TaskItemProps) => {
  const completeTaskWithId = completeTaskAction.bind(null, task.id);

  return (
    <div
      key={task.id}
      className="p-3 border rounded-lg border-white shadow-md shadow-gray-400 hover:bg-gray-300
        flex flex-col gap-3 bg-white"
      onClick={onClick}
    >
      <div className="flex items-center w-full">
        {/* 完了ボタン */}
        <div className="flex-none" onClick={(e) => e.stopPropagation()}>
          <form action={completeTaskWithId}>
            <button
              type="submit"
              title="完了"
              className="flex items-center justify-center"
            >
              <FaCheckCircle size={25} />
            </button>
          </form>
        </div>

        {/* タスク名 */}
        <div className="flex-1 min-w-0 px-2">
          <span className="font-extrabold truncate block">{task.title}</span>
        </div>
      </div>
      <div className="flex">
        {/* 残りの項目を縦に表示 */}
        <div className="flex flex-col ml-6 text-sm text-gray-600">
          <span>期限: {task.dueAt ? task.dueAt : "None"}</span>
          <span>
            予定:{" "}
            {task.estimatedMinutes ? `${task.estimatedMinutes} 分` : "None"} /
            実績: XX 分
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
  );
};

export default TaskItem;
