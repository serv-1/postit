import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import eslintPluginJestDom from 'eslint-plugin-jest-dom'

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      // triggers false-positive errors: to enable when fixed
      // https://github.com/facebook/react/issues/34775
      'react-hooks/refs': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    plugins: { 'plugin-jest-dom': eslintPluginJestDom },
    extends: [eslintPluginJestDom.configs['flat/recommended']],
  },
])

export default eslintConfig
