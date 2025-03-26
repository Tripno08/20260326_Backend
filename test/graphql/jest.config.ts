import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.graphql.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../src/$1',
  },
  setupFiles: ['<rootDir>/../setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/../setup-after-env.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  collectCoverageFrom: [
    '../../src/**/*.(t|j)s',
    '!../../src/**/*.module.(t|j)s',
    '!../../src/**/*.entity.(t|j)s',
    '!../../src/**/*.dto.(t|j)s',
    '!../../src/**/*.interface.(t|j)s',
    '!../../src/**/*.enum.(t|j)s',
    '!../../src/**/*.constant.(t|j)s',
    '!../../src/**/*.config.(t|j)s',
  ],
  coverageDirectory: '../../coverage/graphql',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 300000,
  verbose: true,
  testSequencer: '@jest/test-sequencer',
  maxWorkers: 1,
  maxConcurrency: 1,
}; 