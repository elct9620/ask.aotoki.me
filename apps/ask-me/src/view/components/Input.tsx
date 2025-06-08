import { FC } from "hono/jsx";

interface InputProps {
  className?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (e: Event) => void;
}

export const Input: FC<InputProps> = ({
  className = "",
  ...props
}: InputProps) => {
  return (
    <input
      class={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
};
