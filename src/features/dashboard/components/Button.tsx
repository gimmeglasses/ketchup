// Buttons
const PomodoroButton = ({onClick, children}: {onClick: () => void, children: React.ReactNode}) => {
  return (
    <button type="button" onClick={onClick}
      className="w-30 justify-center group h-8 select-none rounded-lg bg-red-600 text-sm font-bold text-white">
      {children}
    </button>
  );
};

export default PomodoroButton;
