import { Task } from "@/types/task"
import PomodoroButton from "@/features/dashboard/components/Button"

const Pomodoro = ({ task }: { task: Task }) => {

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
    <div className="flex flex-col rounded-lg border-white shadow-md shadow-gray-400 hover:bg-gray-700">
      
      <div className="p-3 border rounded-lg flex flex-col gap-3 bg-white">
        <h1 className="font-bold text-gray-500 text-sm"> ポモドーロタイマー </h1>
        <div className="p-3 
            flex flex-col gap-3 bg-red-50 border border-white border-l-red-600 border-l-4 rounded-lg">
          <div className="flex items-center w-full">          
            {/* タスク名 */}
            <div className="flex-1 min-w-0 px-2 text-gray-600">
              <span className="font-extrabold truncate block">{task.name}</span>
            </div>
          </div>
          <div className="flex flex-col ml-6 text-sm text-gray-700">
            <span>予定: {task.estimatedMin ? `${task.estimatedMin} 分` : "None"} / 実績: XX 分</span>
          </div>
        </div>
        <div className="p-3 flex flex-col gap-3">
          <div className="flex mx-auto text-5xl text-red-600 font-extralight">
            {/* Tentative: 今後の拡張で対応 */}
            25:00
          </div>
          <div className="flex mx-auto gap-6">
            <span><PomodoroButton onClick={handleStartButton}>START</PomodoroButton></span>
            <span><PomodoroButton onClick={handleStopButton}>STOP</PomodoroButton></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;