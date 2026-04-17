import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'], // lcov es el que lee SonarQube
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/tests/**',
        'src/main.jsx',
        'src/data/mockData.js',
      ],
      thresholds: {
        lines:      30,
        functions:  30,
        branches:   30,
        statements: 30,
      }
    }
  }
})
