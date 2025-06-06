import { beforeEach, describe, expect, it, vi } from "vitest";
import { MessageBatch, QueueMessage, QueueRouter } from "../src/index";

// Mock ExecutionContext
class MockExecutionContext {
  waitUntilPromises: Promise<any>[] = [];

  waitUntil(promise: Promise<any>): void {
    this.waitUntilPromises.push(promise);
  }

  passThroughOnException(): void {
    // Mock implementation
  }

  get props(): any {
    return {};
  }
}

// Helper to create a mock message
function createMockMessage(action: string, key: string): QueueMessage {
  return {
    id: "msg-" + Math.random().toString(36).substring(2, 9),
    timestamp: new Date(),
    body: {
      action,
      object: { key },
    },
    attempts: 1,
    retry: vi.fn(),
    ack: vi.fn(),
  };
}

// Helper to create a mock batch
function createMockBatch(messages: QueueMessage[]): MessageBatch {
  return {
    messages,
    queue: "test-queue",
    retryAll: vi.fn(),
    ackAll: vi.fn(),
  };
}

describe("QueueRouter", () => {
  // Mock environment
  interface TestEnv {
    STORAGE: {
      get: vi.Mock;
      put: vi.Mock;
      delete: vi.Mock;
    };
  }

  let router: QueueRouter<TestEnv>;
  let env: TestEnv;
  let ctx: MockExecutionContext;

  beforeEach(() => {
    // Reset mocks and router before each test
    router = new QueueRouter<TestEnv>();
    env = {
      STORAGE: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      },
    };
    ctx = new MockExecutionContext();
  });

  describe("route registration", () => {
    it("should register routes and chain calls", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const result = router
        .on("PutObject", "/content/:type", handler1)
        .on("DeleteObject", "/content/:type/:id", handler2);

      expect(result).toBe(router); // Chaining works
      expect(router["routes"].length).toBe(2); // Routes were registered
    });
  });

  describe("message processing", () => {
    it("should match and process messages with the correct handler", async () => {
      const putHandler = vi.fn().mockResolvedValue(undefined);
      const deleteHandler = vi.fn().mockResolvedValue(undefined);

      router
        .on("PutObject", "/content/:type", putHandler)
        .on("DeleteObject", "/content/:type/:id", deleteHandler);

      const message = createMockMessage("PutObject", "content/images");
      await router.processMessage(message, env, ctx);

      expect(putHandler).toHaveBeenCalledTimes(1);
      expect(putHandler).toHaveBeenCalledWith(
        message,
        { type: "images" },
        env,
        ctx,
      );
      expect(deleteHandler).not.toHaveBeenCalled();
    });

    it("should extract parameters correctly", async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      router.on("DeleteObject", "/content/:type/:id", handler);

      const message = createMockMessage("DeleteObject", "content/images/123");
      await router.processMessage(message, env, ctx);

      expect(handler).toHaveBeenCalledWith(
        message,
        { type: "images", id: "123" },
        env,
        ctx,
      );
    });

    it("should handle greedy path parameters", async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      router.on("GetObject", "/content/:path*", handler);

      const message = createMockMessage(
        "GetObject",
        "content/images/2023/photo.jpg",
      );
      await router.processMessage(message, env, ctx);

      expect(handler).toHaveBeenCalledWith(
        message,
        { path: "images/2023/photo.jpg" },
        env,
        ctx,
      );
    });

    it("should return true when a message is processed", async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      router.on("PutObject", "/content/:type", handler);

      const message = createMockMessage("PutObject", "content/images");
      const result = await router.processMessage(message, env, ctx);

      expect(result).toBe(true);
    });

    it("should return false when no handler matches", async () => {
      router.on("PutObject", "/content/:type", vi.fn());

      const message = createMockMessage("DeleteObject", "content/images");
      const result = await router.processMessage(message, env, ctx);

      expect(result).toBe(false);
    });

    it("should return false for invalid messages", async () => {
      const invalidMessage = {
        id: "msg-invalid",
        timestamp: new Date(),
        body: "not an object", // Invalid body
        attempts: 1,
        retry: vi.fn(),
        ack: vi.fn(),
      };

      const result = await router.processMessage(
        invalidMessage as any,
        env,
        ctx,
      );
      expect(result).toBe(false);
    });

    it("should re-throw errors from handlers", async () => {
      const error = new Error("Handler error");
      const handler = vi.fn().mockRejectedValue(error);

      router.on("PutObject", "/content/:type", handler);
      const message = createMockMessage("PutObject", "content/images");

      await expect(router.processMessage(message, env, ctx)).rejects.toThrow(
        error,
      );
    });
  });

  describe("batch processing", () => {
    it("should process all messages in a batch", async () => {
      const putHandler = vi.fn().mockResolvedValue(undefined);
      const deleteHandler = vi.fn().mockResolvedValue(undefined);

      router
        .on("PutObject", "/content/:type", putHandler)
        .on("DeleteObject", "/content/:type/:id", deleteHandler);

      const messages = [
        createMockMessage("PutObject", "content/images"),
        createMockMessage("DeleteObject", "content/images/123"),
        createMockMessage("PutObject", "content/documents"),
      ];

      const batch = createMockBatch(messages);
      await router.processBatch(batch, env, ctx);

      expect(putHandler).toHaveBeenCalledTimes(2);
      expect(deleteHandler).toHaveBeenCalledTimes(1);

      // Check that all messages were acknowledged
      messages.forEach((msg) => {
        expect(msg.ack).toHaveBeenCalledTimes(1);
      });
    });

    it("should not acknowledge messages that weren't processed", async () => {
      router.on("PutObject", "/content/:type", vi.fn());

      const messages = [
        createMockMessage("PutObject", "content/images"),
        createMockMessage("DeleteObject", "content/images/123"), // No handler for this
      ];

      const batch = createMockBatch(messages);
      await router.processBatch(batch, env, ctx);

      expect(messages[0].ack).toHaveBeenCalledTimes(1);
      expect(messages[1].ack).not.toHaveBeenCalled();
    });

    it("should not acknowledge messages that caused errors", async () => {
      const error = new Error("Handler error");

      router.on(
        "PutObject",
        "/content/:type",
        vi.fn().mockResolvedValue(undefined),
      );
      router.on(
        "DeleteObject",
        "/content/:type",
        vi.fn().mockRejectedValue(error),
      );

      const messages = [
        createMockMessage("PutObject", "content/images"),
        createMockMessage("DeleteObject", "content/images"),
      ];

      const batch = createMockBatch(messages);
      await router.processBatch(batch, env, ctx);

      expect(messages[0].ack).toHaveBeenCalledTimes(1);
      expect(messages[1].ack).not.toHaveBeenCalled();
    });

    it("should handle a mix of successful and failed message processing", async () => {
      router.on("PutObject", "/content/:type", vi.fn());
      // No handler for DeleteObject

      const messages = [
        createMockMessage("PutObject", "content/images"), // Will be handled
        createMockMessage("DeleteObject", "content/images"), // No handler
        createMockMessage("GetObject", "content/images"), // No handler
      ];

      const batch = createMockBatch(messages);
      await router.processBatch(batch, env, ctx);

      expect(messages[0].ack).toHaveBeenCalledTimes(1);
      expect(messages[1].ack).not.toHaveBeenCalled();
      expect(messages[2].ack).not.toHaveBeenCalled();
    });
  });
});
