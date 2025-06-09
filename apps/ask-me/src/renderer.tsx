import { jsxRenderer } from "hono/jsx-renderer";
import { Link, Script, ViteClient } from "vite-ssr-components/hono";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <ViteClient />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="向蒼時弦也提問，獲取有關過去文章的資訊，以及軟體開發為主的觀點、經驗分享。"
        />
        <Script src="/src/client.tsx" />
        <Link href="/src/style.css" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/themes/prism-twilight.min.css"
          integrity="sha512-ch9ThmrGmkVrVm9tL/puGmSfzQps4yk9LDrWuswb65ZnPOIKuYZBen1yn3ez/fEbgeBqrU/IJ443OqgallfE9Q=="
          crossorigin="anonymous"
          referrerpolicy="no-referrer"
        />
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/components/prism-core.min.js"
          integrity="sha512-Uw06iFFf9hwoN77+kPl/1DZL66tKsvZg6EWm7n6QxInyptVuycfrO52hATXDRozk7KWeXnrSueiglILct8IkkA=="
          crossorigin="anonymous"
          referrerpolicy="no-referrer"
        ></script>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.30.0/plugins/autoloader/prism-autoloader.min.js"
          integrity="sha512-SkmBfuA2hqjzEVpmnMt/LINrjop3GKWqsuLSSB3e7iBmYK7JuWw4ldmmxwD9mdm2IRTTi0OxSAfEGvgEi0i2Kw=="
          crossorigin="anonymous"
          referrerpolicy="no-referrer"
        ></script>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossorigin="anonymous"
          referrerpolicy="no-referrer"
        />
        <title>Ask Aotokitsuruya</title>
      </head>
      <div id="app">{children}</div>
    </html>
  );
});
