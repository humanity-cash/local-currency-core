// Jest config for integration tests

const jestMainSetup = require('./jest.config')

module.exports = {
  ...jestMainSetup,
  setupFilesAfterEnv: ['./src/test/setup/setup-db-integration.ts']
}