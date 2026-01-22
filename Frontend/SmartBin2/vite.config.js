import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/", // MUST match repo name exactly

  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      injectRegister: "auto",

      manifest: {
        name: "EcoSort Admin",
        short_name: "EcoSort",
        start_url: "/EcoSort/",
        scope: "/EcoSort/",
        display: "standalone",
        theme_color: "#22c55e",
        background_color: "#ffffff",
      },
    }),
  ],
});
