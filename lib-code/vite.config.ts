import { basename } from "node:path";
import { createHash } from "node:crypto";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { nodeExternals } from "rollup-plugin-node-externals";
import preserveDirectives from "rollup-preserve-directives";

function generateScopedName(local: string, filename: string) {
  const moduleName = basename(filename).replace(/\.module\.css$/, "");
  const hash = createHash("sha256")
    .update(`${filename}:${local}`)
    .digest("base64url")
    .slice(0, 5);
  return `tulldoc-code-${moduleName}__${local}_${hash}`;
}

export default defineConfig({
  css: {
    modules: {
      generateScopedName,
    },
  },
  plugins: [
    { ...nodeExternals(), enforce: "pre" },
    react(),
    preserveDirectives(),
    dts({ include: ["src"] }),
  ],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: {
        index: "src/index.ts",
        server: "src/server.ts",
      },
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        assetFileNames: (info) =>
          info.names?.some((n) => n.endsWith(".css"))
            ? "tulldoc-code.css"
            : "assets/[name][extname]",
      },
    },
  },
});
