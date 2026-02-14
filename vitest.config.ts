import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig(({ mode }) => ({
  test: {
    globals: true,
    environment: "node",
    env: process.env,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
}));
