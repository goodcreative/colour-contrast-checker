import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

/**
 * Resolves `.js` import specifiers to a sibling `.ts` file when present.
 * Lets JS and TS coexist during the 2.0 hybrid migration: existing modules can
 * keep importing `foo.js` while `foo` is ported to `foo.ts`, without touching
 * every import site (or the existing test suite).
 */
function jsToTsResolver() {
  return {
    name: "js-to-ts-resolver",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!source.endsWith(".js")) return null;
      const tsSource = source.slice(0, -3) + ".ts";
      const resolved = await this.resolve(tsSource, importer, { ...options, skipSelf: true });
      return resolved || null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [jsToTsResolver(), vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "",
  test: {
    environment: "jsdom",
  },
});
