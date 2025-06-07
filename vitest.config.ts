import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    workspace: [
      // matches every folder and file inside the `packages` folder
      "packages/*",
      "apps/*",
    ],
    coverage: {
      provider: "istanbul",
      exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
    },
  },
});
