import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const projectRoot = path.resolve(process.cwd());

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
  })],
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  server: {
    middlewareMode: false,
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 5173,
    },
    port: 5173,
    host: '127.0.0.1',
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-markdown', 'lucide-react', 'motion/react'],
  },
});
