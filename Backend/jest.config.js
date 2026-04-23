module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000, // Zvýšený timeout pro databázové operace
  coveragePathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  maxWorkers: 1
};