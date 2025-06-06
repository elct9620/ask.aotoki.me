/**
 * A router for Cloudflare Queue events.
 * Allows registering handlers for action/path combinations and dispatches events accordingly.
 */

import { PathPattern } from './path-pattern';

/**
 * Interface for a message from the Cloudflare Queue.
 */
export interface QueueMessage<T = unknown> {
  id: string;
  timestamp: Date;
  body: T;
  attempts: number;
  retry: (options?: { delaySeconds?: number }) => void;
  ack: () => void;
}

/**
 * Interface for a batch of messages from the Cloudflare Queue.
 */
export interface MessageBatch<T = unknown> {
  messages: readonly QueueMessage<T>[];
  queue: string;
  retryAll: (options?: { delaySeconds?: number }) => void;
  ackAll: () => void;
}

/**
 * Message handler function type.
 */
export type MessageHandler<T = unknown, Env = unknown> = (
  message: QueueMessage<T>,
  params: Record<string, string>,
  env: Env,
  ctx: ExecutionContext
) => void | Promise<void>;

/**
 * Interface for a path pattern that can match against object keys.
 */
export interface PathMatcher {
  /**
   * Check if the path pattern matches the given path.
   */
  match(path: string): { matched: boolean; params: Record<string, string> };
}

/**
 * Route definition interface.
 */
export interface RouteDefinition<T = unknown, E = unknown> {
  action: string;
  pathPattern: PathPattern;
  handler: MessageHandler<T, E>;
}

/**
 * QueueRouter class for routing queue messages based on action and path.
 */
export { PathPattern } from './path-pattern';

export class QueueRouter<Env = unknown> {
  private routes: RouteDefinition<any, Env>[] = [];


  /**
   * Registers a handler for a specific action and path pattern.
   *
   * @param action The action name to match (e.g., "PutObject")
   * @param pathPattern A path pattern string (e.g., "/content/:key")
   * @param handler The handler function to execute on match
   * @returns This router instance for chaining
   */
  on<T = unknown>(action: string, pathPattern: string, handler: MessageHandler<T, Env>): this {
    const pattern = new PathPattern(pathPattern);
    
    this.routes.push({
      action,
      pathPattern: pattern,
      handler,
    });
    
    return this;
  }

  /**
   * Process a queue message.
   *
   * @param message The queue message to process
   * @param env The environment bindings
   * @param ctx The execution context
   * @returns Promise that resolves when processing is complete
   */
  async processMessage(message: QueueMessage, env: Env, ctx: ExecutionContext): Promise<boolean> {
    const body = message.body as { action?: string; object?: { key?: string } };

    if (!body || typeof body !== 'object') {
      console.error('Invalid message body, expected an object');
      return false;
    }

    const action = body.action;
    const objectKey = body.object?.key;

    if (!action || !objectKey) {
      console.error('Message missing action or object key');
      return false;
    }

    // Find matching route
    for (const route of this.routes) {
      if (route.action !== action) continue;

      // Use our PathPattern to match the path
      const result = route.pathPattern.match(objectKey);
      if (result.matched) {
        try {
          await route.handler(message, result.params, env, ctx);
          return true;
        } catch (error: unknown) {
          console.error(`Error processing message: ${error}`);
          throw error; // Re-throw to allow the caller to decide how to handle errors
        }
      }
    }

    // Only log warning if we couldn't find a handler
    console.warn(`No handler found for action: ${action}, path: ${objectKey}`);
    return false;
  }

  /**
   * Process a batch of queue messages.
   *
   * @param batch The message batch to process
   * @param env The environment bindings
   * @param ctx The execution context
   * @returns Promise that resolves when all messages are processed
   */
  async processBatch(batch: MessageBatch, env: Env, ctx: ExecutionContext): Promise<void> {
    const promises = batch.messages.map(async (message) => {
      try {
        const handled = await this.processMessage(message, env, ctx);
        if (handled) {
          message.ack();
        }
      } catch (error: unknown) {
        // Don't acknowledge the message if there was an error
        // This allows it to be retried according to the queue's retry policy
        console.error(`Failed to process message ${message.id}: ${error}`);
      }
    });

    await Promise.all(promises);
  }
}
