import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/md2cards/' : '/',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
});
