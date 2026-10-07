/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

const realRoot = realpathSync(process.cwd());

export default defineConfig({
  root: realRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(realRoot, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(realRoot, './src/tests/setup.ts')],
    globals: true,
    testTimeout: 20000,
  },
});
