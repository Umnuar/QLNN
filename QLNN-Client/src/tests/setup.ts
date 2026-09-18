import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup sau mỗi bài test để tránh rò rỉ bộ nhớ
afterEach(() => {
  cleanup();
});

const localStorageMock = (function () {
  let store: any = {};
  return {
    getItem(key: string) { return store[key]; },
    setItem(key: string, value: string) { store[key] = value; },
    clear() { store = {}; },
    removeItem(key: string) { delete store[key]; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'api', { value: { app: { setZoom: () => {} } } });

