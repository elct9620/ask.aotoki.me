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
 * Interface for a path pattern that can match against object keys.
 */
export interface PathMatcher {
  /**
   * Check if the path pattern matches the given path.
   */
  match(path: string): { matched: boolean; params: Record<string, string> };
}

/**
 * A segment in a path pattern.
 */
interface PathSegment {
  paramName?: string;
  isStatic: boolean;
  isGreedy: boolean;
  isPlus: boolean;
  value: string;
}

/**
 * Route definition interface.
 */
export interface RouteDefinition<T = unknown, E = unknown> {
  action: string;
  pathMatcher: PathMatcher;
  handler: MessageHandler<T, E>;
}

/**
 * QueueRouter class for routing queue messages based on action and path.
 */
export class QueueRouter<Env = unknown> {
  private routes: RouteDefinition<any, Env>[] = [];

  /**
   * Create a path matcher from a pattern string.
   * 
   * @param pattern The pattern string (e.g., "/content/:key", "/content/:path*")
   * @returns A PathMatcher that can match paths against the pattern
   */
  private createPathMatcher(pattern: string): PathMatcher {
    // Normalize the pattern (ensure it starts with /)
    const normalizedPattern = pattern.startsWith('/') ? pattern : '/' + pattern;
    
    // Parse the pattern into segments
    const segments = this.parsePatternSegments(normalizedPattern);
    
    return {
      match(path: string): { matched: boolean; params: Record<string, string> } {
        // Normalize the path (ensure it starts with /)
        const normalizedPath = path.startsWith('/') ? path : '/' + path;
        const pathParts = normalizedPath.split('/').filter(Boolean);
        
        let currentSegmentIndex = 0;
        let currentPathIndex = 0;
        const params: Record<string, string> = {};
        
        // Skip the first empty segment created by the leading /
        if (segments.length > 0 && segments[0].value === '') currentSegmentIndex++;
        
        while (currentSegmentIndex < segments.length) {
          const segment = segments[currentSegmentIndex];
          
          // Static segment must match exactly
          if (segment.isStatic) {
            if (currentPathIndex >= pathParts.length || segment.value !== pathParts[currentPathIndex]) {
              return { matched: false, params: {} };
            }
            currentPathIndex++;
            currentSegmentIndex++;
            continue;
          }
          
          // Handle parameter segments
          if (segment.paramName) {
            // Greedy parameter (matches rest of path)
            if (segment.isGreedy) {
              // If it's the last segment, consume all remaining path parts
              if (currentSegmentIndex === segments.length - 1) {
                const value = pathParts.slice(currentPathIndex).join('/');
                // For * we allow empty matches, for + we require at least one segment
                if (segment.isPlus && value === '') {
                  return { matched: false, params: {} };
                }
                params[segment.paramName] = value;
                return { matched: true, params };
              } 
              // Greedy parameter in the middle is not fully supported
              // For simplicity, match just one segment
              params[segment.paramName] = pathParts[currentPathIndex] || '';
              currentPathIndex++;
            } else {
              // Regular parameter (matches one segment)
              if (currentPathIndex >= pathParts.length) {
                return { matched: false, params: {} };
              }
              params[segment.paramName] = pathParts[currentPathIndex];
              currentPathIndex++;
            }
          }
          
          currentSegmentIndex++;
        }
        
        // If we've consumed all segments but there are still path parts left,
        // it's not a match unless the last segment was greedy
        const lastSegment = segments[segments.length - 1];
        if (currentPathIndex < pathParts.length && 
            !(lastSegment && !lastSegment.isStatic && lastSegment.isGreedy)) {
          return { matched: false, params: {} };
        }
        
        return { matched: true, params };
      }
    };
  }
  
  /**
   * Parse a pattern string into segments.
   * 
   * @param pattern The pattern string
   * @returns Array of PathSegments
   */
  private parsePatternSegments(pattern: string): PathSegment[] {
    const parts = pattern.split('/');
    return parts.map(part => {
      // Check if this is a parameter
      if (part.startsWith(':')) {
        let paramName = part.substring(1);
        let isGreedy = false;
        let isPlus = false;
        
        // Check for modifiers
        if (paramName.endsWith('*')) {
          paramName = paramName.substring(0, paramName.length - 1);
          isGreedy = true;
        } else if (paramName.endsWith('+')) {
          paramName = paramName.substring(0, paramName.length - 1);
          isGreedy = true;
          isPlus = true;
        }
        
        return {
          paramName,
          isStatic: false,
          isGreedy,
          isPlus,
          value: part
        };
      }
      
      // Static segment
      return {
        isStatic: true,
        isGreedy: false,
        isPlus: false,
        value: part
      };
    });
  }

  /**
   * Registers a handler for a specific action and path pattern.
   *
   * @param action The action name to match (e.g., "PutObject")
   * @param pathPattern A path pattern string (e.g., "/content/:key")
   * @param handler The handler function to execute on match
   * @returns This router instance for chaining
   */
  on<T = unknown>(action: string, pathPattern: string, handler: MessageHandler<T, Env>): this {
    const pathMatcher = this.createPathMatcher(pathPattern);
    
    this.routes.push({
      action,
      pathMatcher,
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

      // Use our custom path matcher
      const result = route.pathMatcher.match(objectKey);
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
