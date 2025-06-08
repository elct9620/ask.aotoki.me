import { cloudflare } from "@cloudflare/vite-plugin";
import UnocssVitePlugin from "unocss/vite";
import { defineConfig } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    cloudflare(),
    UnocssVitePlugin(),
    ssrPlugin({
      entry: {
        target: ["src/renderer.tsx"],
      },
    }),
    tsconfigPaths(),
  ],
});
