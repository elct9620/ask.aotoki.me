# @ask-me/queue-router

A simple, pattern-based router for Cloudflare Queue events.

## Features

- Route messages based on action and path patterns
- Extract parameters from paths using flexible pattern syntax
- Strong TypeScript support with generics for message bodies and environment
- Automatic acknowledgement of processed messages

## Installation

```bash
# npm
npm install @ask-me/queue-router

# pnpm
pnpm add @ask-me/queue-router

# yarn
yarn add @ask-me/queue-router
```

## Basic Usage

```typescript
import { QueueRouter } from '@ask-me/queue-router';

// Define your environment type
interface Env {
  MY_KV: KVNamespace;
  MY_R2: R2Bucket;
}

// Create a router with your environment type
const router = new QueueRouter<Env>();

// Register handlers for different actions and paths
router.on('PutObject', '/content/:key', async (message, params, env, ctx) => {
  console.log(`Handling PutObject for ${params.key}`);
  await env.MY_R2.put(params.key, message.body.content);
});

router.on('DeleteObject', '/content/:key*', async (message, params, env, ctx) => {
  console.log(`Handling DeleteObject for ${params.key}`);
  await env.MY_R2.delete(params.key);
});

// In your Worker
export default {
  async queue(batch, env, ctx) {
    await router.processBatch(batch, env, ctx);
  }
};
```

## Route Patterns

The router uses a custom path matching implementation that supports:

- `/content/:key` - Matches a single segment (e.g., `/content/image.jpg` → `key = "image.jpg"`)
- `/content/:path*` - Matches any number of segments, including zero (e.g., `/content/images/photo.jpg` → `path = "images/photo.jpg"`)
- `/content/:path+` - Matches one or more segments (e.g., `/content/images/photo.jpg` → `path = "images/photo.jpg"`)

The implementation is lightweight and optimized for serverless environments, avoiding the limitations of the URLPattern API.

## Message Structure

The router expects messages with this structure:

```typescript
{
  action: string;    // e.g., "PutObject", "DeleteObject"
  object: {
    key: string;     // e.g., "content/image.jpg"
    // ... other properties
  }
  // ... other properties
}
```

## API

### `new QueueRouter<Env>()`

Creates a new router instance with the specified environment type.

### `router.on<T>(action, pathPattern, handler)`

Registers a handler for a specific action and path pattern.

- `action`: The action name to match (e.g., "PutObject")
- `pathPattern`: A path pattern string (e.g., "/content/:key")
- `handler`: The handler function with signature `(message, params, env, ctx) => Promise<void>`

### `router.processBatch(batch, env, ctx)`

Processes a batch of queue messages.

- `batch`: The message batch from Cloudflare Queue
- `env`: The environment bindings
- `ctx`: The execution context

## License

Apache-2.0
