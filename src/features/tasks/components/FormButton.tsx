export type FormButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  type: "button" | "submit";
  variant?: "red" | "teal" | "gray";
};

export const FormButton = ({
  onClick,
  children,
  disabled = false,
  type,
  variant = "red",
}: FormButtonProps) => {
  const variantStyles = {
    red: "hover:bg-red-500 hover:text-red-100",
    teal: "hover:bg-teal-500 hover:text-teal-100",
    gray: "hover:bg-gray-500 hover:text-gray-100",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-30 sm:w-35 flex items-center justify-center group h-10 sm:h-11 select-none rounded-2xl
       bg-gray-200 font-bold text-gray-500 ${variantStyles[variant]}
         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200 disabled:hover:text-gray-500`}
    >
      {children}
    </button>
  );
};
