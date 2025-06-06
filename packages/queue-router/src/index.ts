/**
 * A router for Cloudflare Queue events.
 * Allows registering handlers for action/path combinations and dispatches events accordingly.
 */

// URLPattern is available in Cloudflare Workers but may not be recognized by TypeScript
// This is handled by @cloudflare/workers-types

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
 * Route definition interface.
 */
export interface RouteDefinition<T = unknown, E = unknown> {
  action: string;
  pathPattern: URLPattern;
  handler: MessageHandler<T, E>;
}

/**
 * QueueRouter class for routing queue messages based on action and path.
 */
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
    // Determine if this is a greedy path pattern that should match multiple segments
    const isGreedyPath = pathPattern.includes('*') || 
                         // Detect the pattern has only one or two segments (like 'content/:path')
                         // and we want the last segment to match everything
                         (pathPattern.split('/').length <= 3 && 
                          pathPattern.includes(':') && 
                          !pathPattern.includes('*'));

    // Configure the right pattern based on whether we need greedy matching
    let normalizedPattern;
    
    if (isGreedyPath) {
      // For greedy paths, convert :param to :param(.*)
      normalizedPattern = pathPattern
        .replace(/:([a-zA-Z0-9_]+)/g, ':$1(.*)')
        .replace(/\*/g, '(.*)');
      console.log(`Using greedy pattern matching for ${pathPattern}`);
    } else {
      // For normal paths, convert :param to :param([^/]+)
      normalizedPattern = pathPattern.replace(/:([a-zA-Z0-9_]+)/g, ':$1([^/]+)');
    }
    
    // Ensure path starts with / for consistency
    if (!normalizedPattern.startsWith('/')) {
      normalizedPattern = '/' + normalizedPattern;
    }
    
    // For URLPattern matching, make sure we're dealing with a path pattern that will match routes properly
    const pattern = new URLPattern({ pathname: normalizedPattern });
    console.log(`Registered handler for action=${action}, pattern=${pattern.pathname}`);

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

      // Create a URL to match against the pattern
      // We prepend a dummy origin since URLPattern works with full URLs
      // Try both with and without leading slash to be more flexible
      let matched = false;
      
      // Try with path as-is
      const url1 = new URL(`http://dummy/${objectKey}`);
      console.log(`Trying to match URL: ${url1.pathname}`);
      let match = route.pathPattern.exec(url1);
      
      if (!match && objectKey.startsWith('/')) {
        // Try without leading slash if it has one
        const trimmedKey = objectKey.substring(1);
        const url2 = new URL(`http://dummy/${trimmedKey}`);
        console.log(`Trying alternative URL: ${url2.pathname}`);
        match = route.pathPattern.exec(url2);
      } else if (!match) {
        // Try with leading slash if it doesn't have one
        const url2 = new URL(`http://dummy//${objectKey}`);
        console.log(`Trying alternative URL: ${url2.pathname}`);
        match = route.pathPattern.exec(url2);
      }
      
      console.log(`Trying to match action=${action}, path=${objectKey} against pattern=${route.pathPattern.pathname}`);
      if (match) {
        console.log(`Match found! Params:`, match.pathname.groups);
        try {
          await route.handler(message, match.pathname.groups, env, ctx);
          return true;
        } catch (error) {
          console.error(`Error processing message: ${error}`);
          throw error; // Re-throw to allow the caller to decide how to handle errors
        }
      }
    }

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
      } catch (error) {
        // Don't acknowledge the message if there was an error
        // This allows it to be retried according to the queue's retry policy
        console.error(`Failed to process message ${message.id}: ${error}`);
      }
    });

    await Promise.all(promises);
  }
}
