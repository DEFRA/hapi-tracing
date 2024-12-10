/**
 * @type {Config}
 */
export default {
  rootDir: '.',
  verbose: true,
  resetModules: true,
  clearMocks: true,
  silent: false,
  watchPathIgnorePatterns: ['globalConfig'],
  testMatch: ['**/lib/**/*.test.js'],
  reporters: ['default', ['github-actions', { silent: false }], 'summary'],
  collectCoverageFrom: ['lib/**/*.js'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],
  coverageDirectory: '<rootDir>/coverage'
}

/**
 * @import { Config } from 'jest'
 */
