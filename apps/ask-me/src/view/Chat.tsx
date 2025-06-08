"use client";

import { FC } from "hono/jsx";
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

const mockResponses = ["Working in progress..."];

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
      <ChatSidebar
        suggestedQuestions={suggestedQuestions}
        onSuggestedQuestionClick={handleSuggestedQuestion}
      />

      {/* Main Chat Area */}
      <div class="flex-1 bg-white flex flex-col">
        {/* Chat Header */}
        <ChatHeader />

        {/* Messages Area */}
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
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
