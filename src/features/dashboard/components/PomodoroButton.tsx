// Buttons
export type PomodoroButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
};

const PomodoroButton = ({ onClick, children }: PomodoroButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-16 sm:w-20 justify-center group h-7 sm:h-8 select-none rounded-2xl bg-gray-200 text-sm font-bold text-gray-500 hover:bg-red-500 hover:text-red-100"
    >
      {children}
    </button>
  );
};

export default PomodoroButton;
