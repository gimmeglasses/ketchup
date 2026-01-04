// Buttons
const PomodoroStartButton = ( {onClick, children}: {onClick: () => void, children: React.ReactNode} ) => {
  return (
    <button type="button" onClick={onClick}
      className="w-20 justfy-center
       group h-8 select-none rounded-lg bg-red-700 px-3 text-sm leading-8 
       shadow-[0_-1px_0_1px_#7f1d1d_inset,0_0_0_1px_#b91c1c_inset,0_0.5px_0_1.5px_#f87171_inset]
       active:bg-red-800 active:shadow-[-1px_0px_1px_0px_rgba(0,0,0,.2)_inset,1px_0px_1px_0px_rgba(0,0,0,.2)_inset,0px_0.125rem_0px_0px_rgba(0,0,0,.6)_inset]
       font-bold text-white"
      >
      {children}
    </button>
  );
};

export default PomodoroButton;