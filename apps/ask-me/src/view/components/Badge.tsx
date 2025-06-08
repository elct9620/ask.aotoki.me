import { FC } from "hono/jsx";

interface BadgeProps {
  children: any;
  variant?: "default" | "secondary";
  className?: string;
}

export const Badge: FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}: BadgeProps) => {
  const variantClasses = {
    default: "bg-blue-500 text-white",
    secondary: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
