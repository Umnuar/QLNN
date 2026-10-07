/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

if (fs.existsSync(process.cwd())) {
  const realCwd = fs.realpathSync(process.cwd());
  if (realCwd.toLowerCase() !== process.cwd().toLowerCase()) {
    try {
      process.chdir(realCwd);
    } catch {}
  }
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const realDir = fs.existsSync(currentDir) ? fs.realpathSync(currentDir) : currentDir;

export default defineConfig({
  root: realDir,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(realDir, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(realDir, 'src/tests/setup.ts')],
    globals: true,
    testTimeout: 20000,
  },
});
