/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Deployed as a GitHub Pages project page at
  // seantomburke.github.io/models.fyi. Change to '/' once the
  // custom domain (models.fyi) is set up.
  base: '/models.fyi/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        // Entry points and framework wiring: nothing to assert, executed by the browser.
        'src/main.tsx',
        'src/entry-server.tsx',
        'src/vite-env.d.ts',
        // Type-only modules contribute no runtime statements.
        'src/**/*.d.ts',
        // The tests themselves, and their harness.
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        // Static datasets — hand-maintained records, validated by scripts/validate-data.ts.
        'src/data/**',
      ],
    },
  },
})
