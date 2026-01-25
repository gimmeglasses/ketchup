type AuthDividerProps = {
  text?: string;
};

export function AuthDivider({
  text = "または",
}: AuthDividerProps): React.ReactElement {
  return (
    <div className="mt-6 flex items-center">
      <div className="flex-1 border-t border-red-200"></div>
      <span className="px-3 text-xs text-red-900/50">{text}</span>
      <div className="flex-1 border-t border-red-200"></div>
    </div>
  );
}
