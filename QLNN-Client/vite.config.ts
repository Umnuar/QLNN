import { defineConfig } from 'vite'
import path from 'node:path'
import { realpathSync, existsSync } from 'node:fs'
import react from '@vitejs/plugin-react'

if (existsSync(process.cwd())) {
  const realCwd = realpathSync(process.cwd());
  if (realCwd.toLowerCase() !== process.cwd().toLowerCase()) {
    try {
      process.chdir(realCwd);
    } catch {}
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  root: realpathSync(process.cwd()),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  clearScreen: false,
  server: {
    port: 5174,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  plugins: [
    react(),
  ],
  build: {
    target: process.env.TAURI_ENV_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-excel': ['xlsx'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
