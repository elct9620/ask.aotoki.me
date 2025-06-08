import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    cloudflare(),
    ssrPlugin({
      entry: {
        target: ["src/renderer.tsx"],
      },
    }),
    tsconfigPaths(),
  ],
});
