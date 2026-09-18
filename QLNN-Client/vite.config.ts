import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://qlnn.dulieudakha.vn',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    nodePolyfills({
      include: ['stream', 'buffer', 'util', 'events', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test'
        ? undefined
        : {},
    }),
  ],
})
