import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves project sites under /<repo>/ and paths are
// case-sensitive — must match the repo name exactly ("Aiadventure"). Override
// with BASE_PATH if you deploy elsewhere (e.g. a custom domain → "/").
const base = process.env.BASE_PATH ?? "/Aiadventure/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Cache the app shell + same-origin assets for full offline play.
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "app-icon.svg"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
        // Don't precache font subsets German content never needs — the browser
        // selects subsets by unicode-range, so these would never be requested.
        globIgnores: ["**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2"],
        // SPA fallback so deep links / refreshes work offline.
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: "Vibe Check",
        short_name: "Vibe Check",
        description:
          "Vibe Check — ein interaktives Lernspiel zur Einführung von Claude Code im Team.",
        lang: "de",
        theme_color: "#f5e8d0",
        background_color: "#f5e8d0",
        display: "standalone",
        orientation: "any",
        start_url: base,
        scope: base,
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      devOptions: {
        // Keep the SW off in `vite dev` to avoid stale-cache surprises while coding.
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
