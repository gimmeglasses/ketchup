// Buttons
const PomodoroButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-20 justify-center group h-8 select-none rounded-2xl bg-gray-200 text-sm font-bold text-gray-500 hover:bg-red-500 hover:text-red-100"
    >
      {children}
    </button>
  );
};

export default PomodoroButton;
