import { Message } from "@ai-sdk/ui-utils";
import { OutgoingMessage } from "agents/ai-types";
import { AgentClient } from "agents/client";
import { processDataStream } from "ai";
import { useCallback, useEffect, useState } from "hono/jsx";
import { nanoid } from "nanoid";

interface SendMessagesOptions {
  onTextPart?: (text: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

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

  const setMessages = useCallback(
    async (
      messages: Message[],
      { onTextPart, onComplete, onError }: SendMessagesOptions = {},
    ) => {
      if (!agent) {
        return false;
      }

      const id = nanoid(8);
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

      const response = new Response(stream);

      // Process the data stream if handlers are provided
      if (onTextPart || onComplete || onError) {
        try {
          await processDataStream({
            stream: response.body!,
            onTextPart: onTextPart,
          });
          onComplete?.();
          return true;
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error(String(error)));
          return false;
        }
      }

      return response;
    },
    [agent],
  );

  return {
    setMessages,
  };
};
