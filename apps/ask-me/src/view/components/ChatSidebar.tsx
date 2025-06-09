import { FC } from "hono/jsx";

interface ChatSidebarProps {
  suggestedQuestions: string[];
  onSuggestedQuestionClick: (question: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSidebar: FC<ChatSidebarProps> = ({
  suggestedQuestions,
  onSuggestedQuestionClick,
  isOpen,
  onClose,
}) => {
  return (
    <div
      className={`fixed lg:static lg:w-80 w-72 bg-[#0f2540] text-white p-6 flex flex-col min-h-full z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="lg:hidden absolute right-4 top-4">
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300"
          aria-label="Close sidebar"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>
      <div className="mb-8">
        <h1 className="text-xl lg:text-2xl font-bold mb-4 flex items-center gap-2">
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
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
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
