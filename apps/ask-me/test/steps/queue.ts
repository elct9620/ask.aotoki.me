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
 * Mock queue message for testing
 */
class MockQueueMessage {
  id: string;
  timestamp: Date;
  body: any;
  attempts: number;
  acked: boolean = false;
  retried: boolean = false;

  constructor(body: any) {
    this.id = `mock-${Math.random().toString(36).substring(2, 15)}`;
    this.timestamp = new Date();
    this.body = body;
    this.attempts = 1;
  }

  ack() {
    this.acked = true;
  }

  retry() {
    this.retried = true;
  }
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
  const queueMessages = actions.map(action => {
    const messageId = randomBytes(16).toString("hex");
    
    // Prepare message for the queue
    const queueMessage = {
      id: messageId,
      timestamp: new Date(),
      attempts: 1,
      body: {
        action: action.action,
        object: {
          key: action.key,
        },
      },
    };
    
    if (action.content) {
      queueMessage.body.content = action.content;
    }
    
    return queueMessage;
  });
  
  // Send all messages to the queue at once
  const queueResult = await SELF.queue("ask-me", queueMessages);
  
  // Create corresponding mock messages for test results
  const results = actions.map((action, index) => {
    const message = new MockQueueMessage({
      key: action.key,
      content: action.content,
    });
    
    return {
      success: queueResult.outcome === "ok",
      message,
      queueResult,
    };
  });

  // Return single result or array based on input
  return Array.isArray(params) ? results : results[0];
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
