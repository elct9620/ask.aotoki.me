This project is designed to deploy on Cloudflare Workers.

## Basic

- Use the `pnpm` as the package manager.
- Use the `prettier` for code formatting.
- Use the `vitest` for testing.

## Typescript

- Use `tsconfig.json` for TypeScript configuration.
- Prefer use `@/` instead of `./src/` or `./` for imports.
- Only write JSDoc comments for public APIs.

## Structure

The entry point of the application is `src/index.tsx`. Export the `fetch` and `queue` to handle Cloudflare Workers requests.

### Main

- `src/handlers/`: Contains the handlers for http and queue requests.
  - `src/handlers/http/`: Contains the HTTP request handlers.
  - `src/handlers/queue/`: Contains the queue request handlers.

### Packages

The `packages/<name>` directory contains the packages used in the project. Each package should have its own `package.json` and `tsconfig.json`.

All packages are managed by `pnpm` workspaces. The root `package.json` should contain the workspaces configuration.

## Dependency Injection

Use `tsyringe` for dependency injection. Register dependencies in the `src/container.ts` file. Use `@injectable()` to mark classes as injectable and `@inject()` to inject dependencies.

The `src/usecase/` and `src/entity/` cannot have dependencies. They should be pure functions or classes without side effects.

We will resolve dependencies in the `src/handlers/http/` and `src/handlers/queue/` files then new usecases use resolved dependencies.

## Testing

Keep tests coverage above 90%. Use `pnpm test:coverage` to check the coverage report.

### Feature Testing

The preferred way to test features is to use the `vitest` framework. Use `pnpm test` to run the tests.

To make BDD (Behavior-Driven Development) style tests, use the `describe` and `it` functions from `vitest`. Use `expect` for assertions.

Create the step helper functions in the `tests/steps/` directory.

```ts
describe('Example Feature', () => {
  it('when something happends', async (ctx) => {
    await givenSomeCondition(ctx);
    await whenSomethingHappens(ctx);
    await thenExpectSomething(ctx);
  });
});
```

Use context to pass data between steps. The context is an object that can be used to store data that needs to be shared between steps.

### Unit Testing

When feature testing is not possible, use unit tests. We use `vitest` for unit tests as well.

### Mocking

We have `tsyringe` for dependency injection, so we can use it to mock dependencies in tests. Use `vi.mock()` to mock dependencies in tests.
