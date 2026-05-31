import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Dedicated test config — no PWA plugin, jsdom environment.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
    },
  },
});
