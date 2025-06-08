import { FC } from "hono/jsx";

interface CardProps {
  children: any;
  className?: string;
}

export const Card: FC<CardProps> = ({
  children,
  className = "",
}: CardProps) => {
  return (
    <div
      class={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
};
