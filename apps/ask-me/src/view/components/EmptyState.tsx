import { FC } from "hono/jsx";
import { Button } from "./Button";

interface EmptyStateProps {
  suggestedQuestions: string[];
  onSuggestedQuestionClick: (question: string) => void;
}

export const EmptyState: FC<EmptyStateProps> = ({
  suggestedQuestions,
  onSuggestedQuestionClick,
}) => {
  return (
    <div className="text-center py-12">
      <i className="fas fa-robot text-6xl text-gray-400 mb-4"></i>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        歡迎使用 AI 助手
      </h3>
      <p className="text-gray-500 mb-6">
        我可以幫助您解答軟體開發、架構設計和程式設計相關問題
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestedQuestions.slice(0, 3).map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestedQuestionClick(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};
