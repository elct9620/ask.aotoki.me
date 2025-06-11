"use client";

import { processDataStream } from "ai";
import { FC, useCallback, useEffect, useRef, useState } from "hono/jsx/dom";
import { ChatHeader } from "./components/ChatHeader";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { ChatSidebar } from "./components/ChatSidebar";
import { EmptyState } from "./components/EmptyState";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { useChat } from "./hooks/useChat";
import { useDebounce } from "./hooks/useDebounce";
import { usePrism } from "./hooks/usePrism";
import { Message } from "./types";

const suggestedQuestions = [
  "Golang 的 Clean Architecture 實踐？",
  "Rails 的 Clean Architecture 實踐？",
  "RSpec 與 Cucumber 的比較？",
  "撰寫測試的技巧",
  "軟體架構的思考",
];

export const Chat: FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { highlightAll } = usePrism();
  const { setMessages: sendMessage } = useChat();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const debouncedScrollToBottom = useDebounce(scrollToBottom, 50);

  useEffect(() => {
    debouncedScrollToBottom();
  }, [messages, debouncedScrollToBottom]);

  useEffect(() => {
    highlightAll();
  });

  const handleSendMessage = useCallback(
    (content: string) => {
      // Add the user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      debouncedScrollToBottom();

      // Send all messages, not just the latest one
      const allMessages = [...messages, userMessage].map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }));

      const res = sendMessage(allMessages);

      // Create an AI message ID for tracking
      const aiMessageId = `ai-${Date.now()}`;
      let isFirstTextPart = true;

      if (res && res.body) {
        processDataStream({
          stream: res.body,
          onTextPart: (text) => {
            // On first text part, create the AI message and hide loading indicator
            if (isFirstTextPart) {
              setIsLoading(false);
              // Add AI message when we have actual content
              setMessages((prev) => [
                ...prev,
                {
                  id: aiMessageId,
                  role: "assistant",
                  content: text,
                },
              ]);
              isFirstTextPart = false;
            } else {
              // Update the AI message content as new text arrives
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? { ...msg, content: msg.content + text }
                    : msg,
                ),
              );
            }
          },
        })
          .then(() => {
            // Mark message as no longer streaming when complete
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg,
              ),
            );
            setIsLoading(false);
            debouncedScrollToBottom();
          })
          .catch((error) => {
            console.error("Error processing stream:", error);
            setIsLoading(false);

            // Update the message to show error state
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      content:
                        msg.content ||
                        "Sorry, there was an error generating a response.",
                      isStreaming: false,
                      hasError: true,
                    }
                  : msg,
              ),
            );
          });
      } else {
        setIsLoading(false);
        // Handle case where response doesn't have a body
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Failed to get response from server.",
            hasError: true,
          },
        ]);
      }
    },
    [messages, sendMessage, debouncedScrollToBottom],
  );

  const handleSuggestedQuestion = useCallback(
    (question: string) => {
      handleSendMessage(question);
    },
    [handleSendMessage],
  );

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault();

      if (!input.trim()) return;

      handleSendMessage(input);
      setInput("");
    },
    [input, handleSendMessage],
  );

  const handleInputChange = useCallback(
    (e: Event) => {
      const target = e.target as HTMLInputElement;
      setInput(target.value);
    },
    [setInput],
  );

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, [setIsSidebarOpen]);

  return (
    <div class="flex h-screen max-h-dvh">
      {/* Left Sidebar */}
      <ChatSidebar
        suggestedQuestions={suggestedQuestions}
        onSuggestedQuestionClick={handleSuggestedQuestion}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Chat Area */}
      <div class="flex-1 bg-white flex flex-col max-h-screen w-full">
        {/* Chat Header */}
        <ChatHeader onMenuClick={toggleSidebar} />

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
