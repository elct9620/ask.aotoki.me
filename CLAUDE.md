# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cloudflare Workers application that provides an AI-powered Q&A system for blog.aotoki.me. It uses:
- **Runtime**: Cloudflare Workers with Durable Objects
- **Framework**: Hono with custom SSR components
- **Language**: TypeScript
- **Package Manager**: pnpm with workspaces

## Essential Commands

### Development
```bash
# Install dependencies
pnpm install

# Start development server
cd apps/ask-me && pnpm dev

# Type checking
cd apps/ask-me && pnpm typecheck

# Generate Cloudflare types
cd apps/ask-me && pnpm cf-typegen
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui

# Run specific test file
pnpm test <path-to-test-file>
```

### Build & Deploy
```bash
# Build all packages
pnpm build

# Deploy to Cloudflare Workers
cd apps/ask-me && pnpm deploy
```

## Architecture

### Clean Architecture Layers
1. **Entities** (`src/domain/entity/`): Article, Instruction, Vector
2. **Use Cases** (`src/application/usecase/`): queryArticle, refreshVector, clearVector
3. **Repositories** (`src/infrastructure/repository/`): R2ArticleRepository, CloudflareVectorRepository
4. **Services** (`src/infrastructure/service/`): LLM service, vector encoding
5. **Presenters** (`src/infrastructure/presenter/`): Format data for MCP and Agent responses

### Key Components
- **Dependency Injection**: TSyringe container setup in `src/infrastructure/container.ts`
- **MCP Tools** (`src/mcp/tools/`): Model Context Protocol integration
- **Queue Processing** (`src/queue/`): Handles content update events
- **SSR Components** (`src/components/`): Server-rendered UI with Tailwind CSS

### Cloudflare Bindings (wrangler.jsonc)
- **Durable Objects**: `AskMCP`, `AskMeAgent`
- **R2 Bucket**: `ask-me` for article storage
- **Queue**: `ask-me` for async processing
- **AI**: Cloudflare AI binding
- **Vectorize**: Vector database for similarity search

### Testing Strategy
- Unit tests with mocks in `test/mocks/`
- Test utilities in `test/steps/`
- Use Vitest with Cloudflare Workers test environment
- Mock external services using `unstable_dev` from wrangler

## Important Patterns

### Dependency Injection
Always register new services in the container:
```typescript
// src/infrastructure/container.ts
container.register<YourService>(YourService, {
  useClass: YourServiceImpl,
});
```

### MCP Tool Development
New MCP tools should:
1. Extend the base tool structure in `src/mcp/tools/`
2. Register in the MCP handler
3. Include proper error handling
4. Add corresponding tests

### Queue Message Handling
Queue consumers are defined in `src/queue/index.ts` and process messages for vector updates when blog content changes.

### SSR Component Pattern
Components in `src/components/` use Hono's JSX and should:
- Be server-rendered by default
- Use Tailwind CSS classes
- Follow the existing component structure

## Environment Variables
Required environment variables are defined in:
- `.dev.vars` (local development)
- Cloudflare Workers dashboard (production)

Key variables include OpenAI API keys and other service credentials.