// Buttons
export type PomodoroButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
};

const PomodoroButton = ({ onClick, children, disabled = false }: PomodoroButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-16 sm:w-20 justify-center group h-7 sm:h-8 select-none rounded-2xl bg-gray-200 text-sm font-bold text-gray-500 hover:bg-red-500 hover:text-red-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200 disabled:hover:text-gray-500"
    >
      {children}
    </button>
  );
};

export default PomodoroButton;
