/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Deployed as a GitHub Pages project page at
  // seantomburke.github.io/models.wtf. Change to '/' once the
  // custom domain (models.wtf) is set up.
  base: '/models.wtf/',
  build: {
    // The prerender step uses this to add route-specific module/CSS preloads
    // for direct visits without pulling chart assets into every page.
    manifest: true,
  },
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
