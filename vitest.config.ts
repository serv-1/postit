import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { loadEnvConfig } from '@next/env'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    env: loadEnvConfig(process.cwd()).parsedEnv,
    mockReset: true,
    projects: [
      {
        extends: true,
        test: {
          include: ['**/*.jsdom.test.{ts,tsx}'],
          name: 'jsdom',
          environment: 'jsdom',
          setupFiles: 'vitest.jsdom-setup.ts',
        },
      },
      {
        extends: true,
        test: {
          include: ['**/*.node.test.{ts,tsx}'],
          name: 'node',
          environment: 'node',
        },
      },
    ],
  },
})
