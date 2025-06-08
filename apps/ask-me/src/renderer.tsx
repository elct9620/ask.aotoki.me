import { jsxRenderer } from "hono/jsx-renderer";
import { Script, ViteClient } from "vite-ssr-components/hono";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <ViteClient />
        <Script src="/src/client.tsx" />
        <title>Ask Aotokitsuruya</title>
      </head>
      <div id="app">{children}</div>
    </html>
  );
});
