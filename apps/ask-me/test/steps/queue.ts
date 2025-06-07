import { SELF } from "cloudflare:test";

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

  // Process each action
  const results = await Promise.all(
    actions.map(async (action) => {
      const queueName = action.action.toLowerCase();
      const body = { 
        ...action,
        timestamp: new Date() // Add timestamp as Date object
      };
      delete body.action; // Remove action from body as it's used for routing

      // The Cloudflare Workers queue method expects the body parameter to be an array
      return await SELF.queue(queueName, [body]);
    }),
  );

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
