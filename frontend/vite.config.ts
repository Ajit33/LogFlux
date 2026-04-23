import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/auth":   "http://backend:3000",
      "/logs":   "http://backend:3000",
      "/search": "http://backend:3000",
      "/health": "http://backend:3000",
    },
  },
});