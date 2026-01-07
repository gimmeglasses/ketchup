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
      className="w-20 justify-center group h-8 select-none rounded-2xl bg-red-600 text-sm font-bold text-white"
    >
      {children}
    </button>
  );
};

export default PomodoroButton;
