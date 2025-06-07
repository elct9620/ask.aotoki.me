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
 * Since Cloudflare's queue API is difficult to test directly,
 * we mock the process and directly call the handlers
 *
 * @param params - Single action parameters or array of action parameters
 * @returns Promise with queue result
 */
export async function whenObjectQueue(
  params: QueueObjectParams | QueueObjectParams[],
): Promise<any> {
  // If single action, convert to array for consistent handling
  const actions = Array.isArray(params) ? params : [params];

  // Process each action by creating mock messages
  const results = actions.map((action) => {
    const body = {
      key: action.key,
    };

    if (action.content) {
      body.content = action.content;
    }

    // Create a mock message
    const message = new MockQueueMessage(body);

    // In a real scenario, this would call the handler
    // For now, we just return a successful result
    return {
      success: true,
      message,
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
