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
    <div class={`rounded-lg shadow-sm border ${className}`}>{children}</div>
  );
};
