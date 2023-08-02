const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '^.+\\.(svg)$': require.resolve('./__mocks__/fileMock.tsx'),
  },
  modulePathIgnorePatterns: ['<rootDir>/.*/__mocks__'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['/cypress/'],
  clearMocks: true,
  resetMocks: true,
}

async function jestConfig() {
  const nextJestConfig = await createJestConfig(customJestConfig)()

  nextJestConfig.transformIgnorePatterns[0] =
    'node_modules/?!(@hookform/resolvers)'

  return nextJestConfig
}

module.exports = jestConfig
