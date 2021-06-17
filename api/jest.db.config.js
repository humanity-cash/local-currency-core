// Jest config for integration tests

const jestMainSetup = require('./jest.config')

module.exports = {
  ...jestMainSetup,
  setupFilesAfterEnv: ['./test/setup-db-integration.ts']
}
