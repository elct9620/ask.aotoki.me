import { FC } from "hono/jsx";

interface ChatSidebarProps {
  suggestedQuestions: string[];
  onSuggestedQuestionClick: (question: string) => void;
}

export const ChatSidebar: FC<ChatSidebarProps> = ({
  suggestedQuestions,
  onSuggestedQuestionClick,
}) => {
  return (
    <div className="w-80 bg-[#0f2540] text-white p-6 flex flex-col max-h-screen overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-robot text-xl"></i>
          Ask Aotokitsuruya
        </h1>
        <p className="text-sm leading-relaxed opacity-90">
          向蒼時弦也提問，獲取有關過去文章的資訊，以及軟體開發為主的觀點、經驗分享。
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="flex-1 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-question-circle"></i>
          建議問題
        </h2>
        <div className="space-y-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSuggestedQuestionClick(question)}
              className="w-full text-left p-2 rounded-md bg-[#1a3a5c] hover:bg-[#2a4a6c] transition-colors text-sm"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
