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
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      all: true,                          // Fuerza instrumentar TODOS los archivos
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/tests/**',
        'src/Pages/Homepage.jsx',
        'src/Pages/WidgetsPage.jsx',
        'src/main.jsx',
        'src/data/mockData.js',
        'src/index.css',
        '**/*.config.{js,ts}',
      ],

    }
  }
})
