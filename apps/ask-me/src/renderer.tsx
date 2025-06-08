import { jsxRenderer } from "hono/jsx-renderer";
import { Link, Script, ViteClient } from "vite-ssr-components/hono";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <ViteClient />
        <Script src="/src/client.tsx" />
        <Link href="/src/style.css" rel="stylesheet" />
        <title>Ask Aotokitsuruya</title>
      </head>
      <div id="app">{children}</div>
    </html>
  );
});
