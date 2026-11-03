import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ── Dev server proxy ───────────────────────────────────────────────────────
  // Routes /api/* to the Express backend during local development so you
  // never have to configure CORS or hardcode a local API URL in .env files.
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },

  // ── Production build ───────────────────────────────────────────────────────
  build: {
    outDir: "dist",
    sourcemap: false,   // set to true only for staging builds
    chunkSizeWarningLimit: 1000,
  },
});
