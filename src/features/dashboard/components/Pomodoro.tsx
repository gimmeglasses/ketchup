import { memo } from "react"
import { Task } from "@/types/task"
import PomodoroButton from "@/features/dashboard/components/Button" 

const Pomodoro = ( { task }: { task: Task } ) => {
  console.log("task:", task)

  // No rendering if task is invalid
  if (!task || !task.id) {
    return null;
  }
  
  // STARTボタン押下後の処理を記載
  const handleStartButton = () => {
    // Tentative: 今後の拡張で対応
    console.log("Start button is clicked.")
  }

  // STOPボタン押下後の処理を記載
  const handleStopButton = () => {
    // Tentative: 今後の拡張で対応
    console.log("Stop button is clicked.")
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-1.5xl font-bold"> ポモドーロタイマー </h1>
      <div className="p-3 border rounded shadow-md shadow-red-900 
            flex flex-col gap-3 bg-red-200 border-red-200 text-red-900">
        <div className="flex items-center w-full">          
          {/* タスク名 */}
          <div className="flex−1 min-w-0 px-2">
            <span className="font-extrabold text-gray-600 truncate block">{task.name}</span>
          </div>
        </div>
        <div className="flex flex-col ml-6 text-sm text-gray-700">
          <span>予定: {task.estimatedMin ? `${task.estimatedMin} 分` : "None"} / 実績: XX 分</span>
        </div>
        <div className="flex mx-auto text-5xl">
          {/* Tentative: 今後の拡張で対応 */}
          25:00
        </div>
        <div className="flex mx-auto gap-6">
          <span><PomodoroButton onClick={handleStartButton}>START</PomodoroButton></span>
          <span><PomodoroButton onClick={handleStopButton}>STOP</PomodoroButton></span>
        </div>
      </div>
    </div>
  );
};

export default memo(Pomodoro);