"use client"

import { useState } from "react"
import Link from "next/link"
import Pomodoro from "@/features/dashboard/components/Pomodoro"
import { Task } from "@/types/task"

const DashboardContainer = ( { incompleteTasks }: { incompleteTasks: Task[] }  ) => {


  // Pomodoroタイマーを利用するタスクを格納。画面からタスクをクリックすることで div tag の onClick が呼ばれる。
  const [ selectedTask, setSelectedTask ] = useState<Task | null>(null);
  const handleClick = (task: Task) => {
    setSelectedTask(task)
  };

  // チェックボックスがONになったタスクを格納。
  const [ checkedTasks, setCheckedTasks ] = useState<{ [id: string] : boolean }>({});
  const handleChecked = (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    // div tag の onClick イベントを回避
    event.stopPropagation(); 
    setCheckedTasks(prev => ({
      ...prev,
      [taskId] : event?.target.checked
    }))
  };

  return (
    <>
      {/* Display "New task entry" button */}
      <div >
        <Link href="/tasks/new" 
              className="flex justify-center rounded-lg bg-red-600
              font-semibold text-white shadow-md shadow-gray-400 
              transition hover:-translate-y-0.5 hover:bg-gray-700 mb-4">
          タスク追加
        </Link>
      </div>

      {/* Dynamically display a selected task for using Pomodoro timer */}
      {selectedTask && <Pomodoro task={selectedTask}/>}

      {/* Display task list */}
      <div className="flex flex-col gap-4 mt-4 text-gray-600">
        <h1 className="text-1.5xl font-bold">今日のタスク</h1>
        {incompleteTasks.map((task) => (
          <div key={task.id} 
            className="p-3 border rounded-lg border-white shadow-md shadow-gray-400 hover:bg-gray-700 
              flex flex-col gap-3 bg-white"
            onClick={() => handleClick(task)}
            >

            <div className="flex items-center w-full">
              {/* チェックボックス*/}
              {/* 今後、削除機能またはタスク完了処理で利用（仮） */}
              <div className="flex-none">
                <input className="text-red-600 rounded focus:ring-red-500" 
                       type="checkbox" 
                       checked={checkedTasks[task.id] || false} 
                       onChange={(event) => handleChecked(task.id, event)}/>
              </div>
              
              {/* タスク名 */}
              <div className="flex-1 min-w-0 px-2">
                <span className="font-extrabold truncate block">{task.name}</span>
              </div>
              
            </div>
            <div className="flex ">
              {/* 残りの項目を縦に表示 */}
              <div className="flex flex-col ml-6 text-sm text-gray-600">
                <span>期限: {task.dueDate ? task.dueDate : "None"}</span>
                <span>予定: {task.estimatedMin ? `${task.estimatedMin} 分` : "None"} / 実績: XX 分</span>
              </div>
              {/* 編集ボタン */}
              <div className="flex-none ml-auto mt-1">
                <Link href={`/tasks/${task.id}/edit`} 
                      className="font-bold text-xs text-white px-2 py-4 bg-red-600 hover:underline border rounded p-1"
                      onClick={(event) => {event.stopPropagation();}}>
                  編集
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )  
};

export default DashboardContainer;
