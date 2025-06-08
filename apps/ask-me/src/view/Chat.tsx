"use client";

import { processDataStream } from "ai";
import { FC, useEffect, useRef, useState } from "hono/jsx/dom";
import { ChatHeader } from "./components/ChatHeader";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { ChatSidebar } from "./components/ChatSidebar";
import { EmptyState } from "./components/EmptyState";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { useChat } from "./hooks/useChat";
import { Message } from "./types";

const suggestedQuestions = [
  "Golang 的 Clean Architecture 實踐？",
  "Rails 的 Clean Architecture 實踐？",
  "RSpec 與 Cucumber 的比較？",
];

export const Chat: FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { setMessages: sendMessage } = useChat();

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    // Add the user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create an initial AI message with empty content
    const aiMessageId = `ai-${Date.now()}`;
    const initialAiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    // Add the initial empty AI message to show typing effect
    setMessages((prev) => [...prev, initialAiMessage]);

    const res = sendMessage([
      {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
      }
    ]);

    if (res && res.body) {
      processDataStream({
        stream: res.body,
        onTextPart: (text) => {
          // Update the AI message content as new text arrives
          setMessages((prev) => 
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: msg.content + text }
                : msg
            )
          );
          
          // Make sure to scroll to bottom as new content arrives
          scrollToBottom();
        },
      }).then(() => {
        // Mark message as no longer streaming when complete
        setMessages((prev) => 
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
        setIsLoading(false);
      }).catch(error => {
        console.error("Error processing stream:", error);
        setIsLoading(false);
        
        // Update the message to show error state
        setMessages((prev) => 
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { 
                  ...msg, 
                  content: msg.content || "Sorry, there was an error generating a response.", 
                  isStreaming: false,
                  hasError: true
                }
              : msg
          )
        );
      });
    } else {
      setIsLoading(false);
      // Handle case where response doesn't have a body
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "system",
          content: "Failed to get response from server.",
          timestamp: new Date(),
          hasError: true
        }
      ]);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    if (!input.trim()) return;

    handleSendMessage(input);
    setInput("");
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
      <div class="flex-1 bg-white flex flex-col max-h-screen">
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
