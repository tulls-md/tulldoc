import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { nodeExternals } from "rollup-plugin-node-externals";
import preserveDirectives from "rollup-preserve-directives";

export default defineConfig({
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
