import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@skill-spark/api-client": path.resolve(
        __dirname,
        "../../packages/api-client/src/index.ts"
      ),
      "@skill-spark/contracts": path.resolve(
        __dirname,
        "../../packages/contracts/src/index.ts"
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
