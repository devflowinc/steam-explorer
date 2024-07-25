// @ts-ignore
import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @ts-ignore
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 5173,
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: [".."],
    },
  },
});
