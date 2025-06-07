import { SELF } from "cloudflare:test";
import { randomBytes } from "node:crypto";

/**
 * Queue object action params interface
 */
interface QueueObjectParams {
  action: string; // e.g. "PutObject" or "DeleteObject"
  key: string;
  [key: string]: any; // Additional parameters
}

/**
 * Queue a message for testing
 *
 * @param params - Single action parameters or array of action parameters
 * @returns Promise with queue result
 */
export async function whenObjectQueue(
  params: QueueObjectParams | QueueObjectParams[],
): Promise<any> {
  // If single action, convert to array for consistent handling
  const actions = Array.isArray(params) ? params : [params];

  // Prepare all messages for the queue at once
  const queueMessages = actions.map((event) => {
    const messageId = event.id || randomBytes(16).toString("hex");
    if (event.id) {
      delete event.id; // Remove id from event to avoid duplication
    }

    // Prepare message for the queue
    const queueMessage = {
      id: messageId,
      timestamp: new Date(),
      attempts: 1,
      body: {
        action: event.action,
        object: {
          key: event.key,
        },
      },
    };

    return queueMessage;
  });

  // Send all messages to the queue at once
  return await SELF.queue("ask-me", queueMessages);
}

/**
 * Generic action builder for queue tests
 *
 * @param action - The action name (e.g. "PutObject")
 * @param key - The object key
 * @param additionalParams - Any additional parameters
 * @returns Queue object params
 */
export function buildQueueAction(
  action: string,
  key: string,
  additionalParams: Record<string, any> = {},
): QueueObjectParams {
  return {
    action,
    key,
    ...additionalParams,
  };
}
