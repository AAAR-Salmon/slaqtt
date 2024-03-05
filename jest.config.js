/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/src',
  ],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};

module.exports = config;
