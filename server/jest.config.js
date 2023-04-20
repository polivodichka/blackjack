module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/__tests__/**/*.spec.[jt]s?(x)', '**/*.test.[jt]s?(x)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{ts,js}', '!**/node_modules/**']
}
