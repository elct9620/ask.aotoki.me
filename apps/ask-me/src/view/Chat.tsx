"use client";

import { FC, useCallback, useEffect, useRef, useState, useMemo } from "hono/jsx/dom";
import { nanoid } from "nanoid";
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
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { highlightAll } = usePrism();
  const { setMessages: sendMessages } = useChat();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const debouncedScrollToBottom = useDebounce(scrollToBottom, 10);

  useEffect(() => {
    debouncedScrollToBottom();
  }, [messages, debouncedScrollToBottom]);

  const handleSendMessage = useCallback(
    (content: string) => {
      // Add the user message
      const userMessage: Message = {
        id: nanoid(8),
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      debouncedScrollToBottom();

      // Create an AI message ID for streaming
      const aiMessageId = nanoid(8);

      // Send all messages, not just the latest one
      const allMessages = [...messages, userMessage].map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }));

      // Process the response using the hook
      sendMessages(allMessages, {
        onTextPart: (text) => {
          // Hide loading indicator when streaming starts
          setIsLoading(false);
          
          if (!streamingMessage) {
            // Create a new streaming message on first part
            setStreamingMessage({
              id: aiMessageId,
              role: "assistant",
              content: text,
              isStreaming: true,
            });
          } else {
            // Update the streaming message content as new text arrives
            setStreamingMessage(prev => 
              prev ? { ...prev, content: prev.content + text } : prev
            );
          }

          // Make sure to scroll to bottom as new content arrives
          debouncedScrollToBottom();
        },
        onComplete: () => {
          // Add completed message to message list and clear streaming state
          if (streamingMessage) {
            setMessages(prev => [
              ...prev, 
              { ...streamingMessage, isStreaming: false }
            ]);
            setStreamingMessage(null);
          }
          
          setIsLoading(false);
          highlightAll();
          debouncedScrollToBottom();
        },
        onError: (error) => {
          console.error("Error processing stream:", error);
          setIsLoading(false);

          // Add error message if we have a streaming message
          if (streamingMessage) {
            setMessages(prev => [
              ...prev,
              {
                ...streamingMessage,
                content: streamingMessage.content || "Sorry, there was an error generating a response.",
                isStreaming: false,
                hasError: true,
              }
            ]);
            setStreamingMessage(null);
          }
        },
      }).catch(() => {
        setIsLoading(false);
        // Handle case where response doesn't have a body
        setMessages((prev) => [
          ...prev,
          {
            id: nanoid(8),
            role: "assistant",
            content: "Failed to get response from server.",
            hasError: true,
          },
        ]);
      });
    },
    [messages, sendMessages, debouncedScrollToBottom],
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
          
          {streamingMessage && (
            <ChatMessage key={streamingMessage.id} message={streamingMessage} />
          )}

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
