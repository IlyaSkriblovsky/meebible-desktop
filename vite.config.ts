import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    checker({ typescript: true }),
    legacy({
      targets: ["safari 13"],
    }),
  ],
  define: {
    // @ts-expect-error process is a nodejs global
    __APP_RUNTIME__: JSON.stringify(process.env.TAURI_ENV_PLATFORM ? "tauri" : "web"),
    // @ts-expect-error process is a nodejs global
    __TAURI_PLATFORM_VERSION__: JSON.stringify(process.env.TAURI_ENV_PLATFORM_VERSION),
    // @ts-expect-error process is a nodejs global
    __TAURI_TARGET_TRIPLE__: JSON.stringify(process.env.TAURI_ENV_TARGET_TRIPLE),
    // @ts-expect-error process is a nodejs global
    __BUNDLE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
