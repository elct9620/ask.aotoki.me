"use client";

import { FC, useEffect, useRef, useState } from "hono/jsx";
import { ChatHeader } from "./components/ChatHeader";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { ChatSidebar } from "./components/ChatSidebar";
import { EmptyState } from "./components/EmptyState";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { Message } from "./types";

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

export const Chat: FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestedQuestion = (question: string) => {
    // Add the user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responseIndex = Math.floor(Math.random() * mockResponses.length);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: mockResponses[responseIndex],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add the user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responseIndex = Math.floor(Math.random() * mockResponses.length);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: mockResponses[responseIndex],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setInput(target.value);
  };

  return (
    <div class="flex min-h-screen">
      {/* Left Sidebar */}
      <ChatSidebar
        suggestedQuestions={suggestedQuestions}
        onSuggestedQuestionClick={handleSuggestedQuestion}
      />

      {/* Main Chat Area */}
      <div class="flex-1 bg-white flex flex-col">
        {/* Chat Header */}
        <ChatHeader />

        {/* Messages Area */}
        <div
          class="flex-1 overflow-y-auto p-6 space-y-4"
          style="max-height: calc(100vh - 180px);"
        >
          {messages.length === 0 && (
            <EmptyState
              suggestedQuestions={suggestedQuestions}
              onSuggestedQuestionClick={handleSuggestedQuestion}
            />
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <ChatInput
          input={input}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};
