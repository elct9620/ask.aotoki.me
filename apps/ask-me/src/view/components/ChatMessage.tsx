"use client";

import { FC, useEffect } from "hono/jsx";
import { useMarkdown } from "../hooks/useMarkdown";
import { usePrism } from "../hooks/usePrism";
import { Message } from "../types";
import { Card } from "./Card";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const { highlightAll } = usePrism();
  const { render } = useMarkdown();

  useEffect(() => {
    highlightAll();
  }, [message]);

  return (
    <div
      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex gap-3 max-w-3xl ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
      >
        <div>
          <div
            className={`size-8 rounded-full flex items-center justify-center ${
              message.role === "user"
                ? "bg-[#51a8dd] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {message.role === "user" ? (
              <i className="fas fa-user text-sm"></i>
            ) : (
              <i className="fas fa-robot text-sm"></i>
            )}
          </div>
        </div>
        <Card
          className={`p-4 ${
            message.role === "user"
              ? "bg-[#51a8dd] text-white border-[#51a8dd]"
              : "bg-gray-50"
          }`}
        >
          <div
            className={`prose prose-sm max-w-none ${
              message.role === "user"
                ? "prose-p:text-white prose-a:text-white"
                : ""
            }`}
            dangerouslySetInnerHTML={render(message.content)}
          />
        </Card>
      </div>
    </div>
  );
};
