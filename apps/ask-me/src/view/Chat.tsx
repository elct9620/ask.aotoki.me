"use client";

import { FC } from "hono/jsx";

const suggestedQuestions = [
  "什麼是 Clean Architecture？",
  "如何管理軟體依賴？",
  "解釋依賴反轉原則",
  "軟體架構設計最佳實踐",
  "How to implement dependency injection?",
  "What are the benefits of modular architecture?",
];

const mockResponses = [
  "Clean Architecture 是由 Robert C. Martin (Uncle Bob) 提出的軟體架構設計原則。它的核心概念是將系統分為多個層次，每個層次都有明確的職責，並且依賴關係只能向內指向。\n\n主要特點包括：\n• 獨立於框架\n• 可測試性高\n• 獨立於 UI\n• 獨立於資料庫\n• 獨立於外部代理\n\n這種架構讓系統更容易維護、測試和擴展。",

  "軟體依賴管理是確保系統各個組件之間關係清晰、可控的重要實踐。以下是一些關鍵策略：\n\n1. **依賴反轉原則 (DIP)**\n   - 高層模組不應該依賴低層模組\n   - 兩者都應該依賴於抽象\n\n2. **依賴注入 (Dependency Injection)**\n   - 通過外部注入依賴，而不是內部創建\n   - 提高可測試性和靈活性\n\n3. **介面隔離**\n   - 使用介面定義契約\n   - 減少耦合度",

  "依賴反轉原則 (Dependency Inversion Principle) 是 SOLID 原則中的 'D'，它包含兩個重要概念：\n\n**原則內容：**\n1. 高層模組不應該依賴低層模組，兩者都應該依賴於抽象\n2. 抽象不應該依賴於具體實現，具體實現應該依賴於抽象\n\n**實際應用：**\n```typescript\n// 錯誤的做法\nclass OrderService {\n  private database = new MySQLDatabase(); // 直接依賴具體實現\n}\n\n// 正確的做法\ninterface Database {\n  save(data: any): void;\n}\n\nclass OrderService {\n  constructor(private database: Database) {} // 依賴抽象\n}\n```\n\n這樣可以讓程式碼更靈活、可測試且易於維護。",

  "軟體架構設計的最佳實踐包括以下幾個重要方面：\n\n**1. 分層架構**\n• 清晰的層次劃分\n• 單向依賴關係\n• 職責分離\n\n**2. 模組化設計**\n• 高內聚、低耦合\n• 明確的介面定義\n• 可重用的組件\n\n**3. 設計原則**\n• SOLID 原則\n• DRY (Don't Repeat Yourself)\n• KISS (Keep It Simple, Stupid)\n\n**4. 架構模式**\n• MVC/MVP/MVVM\n• Repository Pattern\n• Factory Pattern\n\n**5. 可測試性**\n• 依賴注入\n• Mock 和 Stub\n• 單元測試覆蓋率",

  "Dependency Injection is a design pattern that implements Inversion of Control (IoC) for resolving dependencies. Here's how to implement it effectively:\n\n**Key Concepts:**\n1. **Constructor Injection** - Dependencies passed through constructor\n2. **Setter Injection** - Dependencies set through setter methods\n3. **Interface Injection** - Dependencies provided through interface methods\n\n**Implementation Example:**\n```typescript\n// Define interface\ninterface IEmailService {\n  sendEmail(to: string, message: string): void;\n}\n\n// Implement service\nclass EmailService implements IEmailService {\n  sendEmail(to: string, message: string): void {\n    // Email sending logic\n  }\n}\n\n// Inject dependency\nclass UserService {\n  constructor(private emailService: IEmailService) {}\n  \n  registerUser(user: User): void {\n    // Registration logic\n    this.emailService.sendEmail(user.email, 'Welcome!');\n  }\n}\n```\n\n**Benefits:**\n• Improved testability\n• Loose coupling\n• Better maintainability\n• Easier mocking for tests",

  "Modular architecture offers several significant benefits for software development:\n\n**1. Maintainability**\n• Easier to understand and modify individual modules\n• Changes in one module don't affect others\n• Clear separation of concerns\n\n**2. Reusability**\n• Modules can be reused across different projects\n• Reduces code duplication\n• Faster development cycles\n\n**3. Testability**\n• Each module can be tested independently\n• Easier to write unit tests\n• Better test coverage\n\n**4. Scalability**\n• Teams can work on different modules simultaneously\n• Easier to scale development efforts\n• Independent deployment of modules\n\n**5. Flexibility**\n• Easy to swap implementations\n• Support for different configurations\n• Adaptable to changing requirements\n\n**Implementation Tips:**\n• Define clear interfaces between modules\n• Minimize inter-module dependencies\n• Use dependency injection\n• Follow single responsibility principle",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Custom Button Component
interface ButtonProps {
  variant?: "primary" | "outline";
  size?: "default" | "sm";
  children: any;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}

const Button = ({
  variant = "primary",
  size = "default",
  children,
  className = "",
  ...props
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer border-0";
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  };
  const sizeClasses = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1.5 text-sm",
  };

  return (
    <button
      class={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Input Component
interface InputProps {
  className?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (e: Event) => void;
}

const Input = ({ className = "", ...props }: InputProps) => {
  return (
    <input
      class={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
};

// Custom Card Component
interface CardProps {
  children: any;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      class={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
};

// Custom Badge Component
interface BadgeProps {
  children: any;
  variant?: "default" | "secondary";
  className?: string;
}

const Badge = ({
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

export const Chat: FC = () => {
  const messages: Message[] = [];
  const input = "";
  const isLoading = false;

  const handleSuggestedQuestion = (question: string) => {
    // Handle suggested question click
    console.log("Suggested question:", question);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted");
  };

  const handleInputChange = (e: Event) => {
    // Handle input change
    const target = e.target as HTMLInputElement;
    console.log("Input changed:", target.value);
  };

  return (
    <div class="flex min-h-screen">
      {/* Left Sidebar */}
      <div class="w-80 bg-[#0f2540] text-white p-6 flex flex-col">
        <div class="mb-8">
          <h1 class="text-2xl font-bold mb-4 flex items-center gap-2">
            <i class="fas fa-robot text-xl"></i>
            Ask Aotokitsuruya
          </h1>
          <p class="text-sm leading-relaxed opacity-90">
            您的軟體開發助手，專精於 Clean
            Architecture、依賴管理和軟體工程最佳實踐。
          </p>
        </div>

        {/* Suggested Questions */}
        <div class="flex-1 mb-8">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="fas fa-question-circle"></i>
            建議問題
          </h2>
          <div class="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                class="w-full text-left p-2 rounded-md bg-[#1a3a5c] hover:bg-[#2a4a6c] transition-colors text-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div class="flex-1 bg-white flex flex-col">
        {/* Chat Header */}
        <div class="border-b border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold">AI 助手對話</h1>
              <p class="text-gray-600">隨時為您解答軟體開發相關問題</p>
            </div>
            <div class="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <div class="size-2 bg-green-500 rounded-full mr-2"></div>
                線上服務中
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div class="text-center py-12">
              <i class="fas fa-robot text-6xl text-gray-400 mb-4"></i>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">
                歡迎使用 AI 助手
              </h3>
              <p class="text-gray-500 mb-6">
                我可以幫助您解答軟體開發、架構設計和程式設計相關問題
              </p>
              <div class="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              class={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                class={`flex gap-3 max-w-3xl ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  class={`size-8 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-[#51a8dd] text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {message.role === "user" ? (
                    <i class="fas fa-user text-sm"></i>
                  ) : (
                    <i class="fas fa-robot text-sm"></i>
                  )}
                </div>
                <Card
                  className={`p-4 ${message.role === "user" ? "bg-[#51a8dd] text-white border-[#51a8dd]" : "bg-gray-50"}`}
                >
                  <div class="prose prose-sm max-w-none">
                    <p class="whitespace-pre-wrap m-0">{message.content}</p>
                  </div>
                </Card>
              </div>
            </div>
          ))}

          {isLoading && (
            <div class="flex gap-3 justify-start">
              <div class="size-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <i class="fas fa-robot text-sm"></i>
              </div>
              <Card className="p-4 bg-gray-50">
                <div class="flex items-center gap-2">
                  <div class="flex space-x-1">
                    <div class="size-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      class="size-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      class="size-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span class="text-sm text-gray-500">AI 正在思考中...</span>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div class="border-t border-gray-200 p-6">
          <form onSubmit={handleSubmit} class="flex gap-3">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="輸入您的問題..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <i class="fas fa-paper-plane"></i>
            </Button>
          </form>
          <div class="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>按 Enter 發送訊息</span>
            <span>由 AI 技術驅動</span>
          </div>
        </div>
      </div>
    </div>
  );
};
