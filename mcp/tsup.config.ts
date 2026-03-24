import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["server.ts"],
  format: ["cjs"],
  outDir: "dist",
  target: "node18",
  clean: true,
  minify: false,
});
