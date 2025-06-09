import { FC } from "hono/jsx";
import { Button } from "./Button";
import { Input } from "./Input";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onSubmit: (e: Event) => void;
  onChange: (e: Event) => void;
}

export const ChatInput: FC<ChatInputProps> = ({
  input,
  isLoading,
  onSubmit,
  onChange,
}) => {
  return (
    <div className="border-t border-gray-200 p-4 lg:p-6">
      <form onSubmit={onSubmit} className="flex gap-2 lg:gap-3">
        <Input
          value={input}
          onChange={onChange}
          placeholder="輸入您的問題..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <i className="fas fa-paper-plane"></i>
        </Button>
      </form>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-3 text-xs text-gray-500">
        <span>按 Enter 發送訊息</span>
        <span className="mt-1 lg:mt-0">由 AI 技術驅動</span>
      </div>
    </div>
  );
};
