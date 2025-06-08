"use client";

import { Message } from "@ai-sdk/ui-utils";
import { OutgoingMessage } from "agents/ai-types";
import { AgentClient } from "agents/client";
import { useCallback, useEffect, useState } from "hono/jsx";
import { nanoid } from "nanoid";

export const useChat = () => {
  const [agent, setAgent] = useState<AgentClient | null>(null);

  useEffect(() => {
    const agent = new AgentClient({
      agent: "ask-me-agent", // binding name in wrangler.jsonc
      host: window.location.host,
    });

    setAgent(agent);

    return () => {
      agent.close();
      setAgent(null);
    };
  }, []);

  const sendMessage = useCallback(
    (message: string) => {
      if (!agent) {
        return;
      }

      const id = nanoid(8);
      const messages: Message[] = [
        {
          id: nanoid(8),
          role: "user",
          content: message,
        },
      ];

      let controller: ReadableStreamDefaultController;
      const stream = new ReadableStream({
        start(c) {
          controller = c;
        },
      });

      agent.addEventListener("message", (event: MessageEvent) => {
        let data: OutgoingMessage;
        try {
          data = JSON.parse(event.data) as OutgoingMessage;
        } catch (error) {
          return;
        }

        if (data.type === "cf_agent_use_chat_response" && data.id === id) {
          controller.enqueue(new TextEncoder().encode(data.body));
          if (data.done) {
            controller.close();
          }
        }
      });

      agent.send(
        JSON.stringify({
          type: "cf_agent_use_chat_request",
          id,
          init: {
            method: "POST",
            body: JSON.stringify({
              messages,
            }),
          },
        }),
      );

      return new Response(stream);
    },
    [agent],
  );

  return {
    sendMessage,
  };
};
