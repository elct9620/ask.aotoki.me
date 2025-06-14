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

```
| apps/
    |- ask-me/       # The main application
        |- src/
            |- index.tsx     # Entry point for Cloudflare Workers
            |- client.tsx    # Client-side code for Cloudflare Workers
            |- container.ts  # Dependency injection container
            |- usecase/      # Use cases for the application
                |- <usecase_name>.ts # Each use case should be in its own file
            |- entity/       # Entities for the application
                |- <entity_name>.ts # Each entity should be in its own file
            |- repository/   # Repositories for the application
                |- <repository_name>.ts # Each repository should be in its own file
            |- service/      # Services for the application (non domain-related)
                |- <service_name>.ts # Each service should be in its own file
            |- handlers/     # Handlers for any type of request, such as HTTP or queue
                |- http/
                |- queue/
                |- tools/
|- packages/         # Packages used in the project
    |- <name>/
        |- package.json
        |- tsconfig.json
```

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

## JSX

We use `hono/jsx` instead of React for JSX. The `hono/jsx` is a lightweight JSX library that works well with Cloudflare Workers.

When working with JSX, use the `hono/jsx` library to create elements. The available hooks is below:

- `useState()`
- `useEffect()`
- `useRef()`
- `useCallback()`
- `use()`
- `startTransition()`
- `useTransition()`
- `useDeferredValue()`
- `useMemo()`
- `useLayoutEffect()`
- `useReducer()`
- `useDebugValue()`
- `createElement()`
- `memo()`
- `isValidElement()`
- `useId()`
- `createRef()`
- `forwardRef()`
- `useImperativeHandle()`
- `useSyncExternalStore()`
- `useInsertionEffect()`
- `useFormStatus()`
- `useActionState()`
- `useOptimistic()`

## Testing

Keep tests coverage above 90%. Use `pnpm test:coverage` to check the coverage report.

### Feature Testing

The preferred way to test features is to use the `vitest` framework. Use `pnpm test` to run the tests.

To make BDD (Behavior-Driven Development) style tests, use the `describe` and `it` functions from `vitest`. Use `expect` for assertions.

Create the step helper functions in the `test/steps/` directory.

```ts
describe("Example Feature", () => {
  it("when something happends", async (ctx) => {
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
