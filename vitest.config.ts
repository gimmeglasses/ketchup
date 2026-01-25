/**
 * Vitest configuration for React components using the jsdom environment.
 */
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{e2e,playwright}/**",
    ],
    reporters: process.env.GITHUB_ACTIONS ? ["dot", "github-actions"] : ["dot"],
    coverage: {
      enabled: true,
      reporter: ["text-summary", "json-summary", "json"],
      reportOnFailure: true,
      exclude: ["**/*.d.ts", "**/index.ts", "**/main.tsx", "**/vite.config.*"],
    },
  },
});
