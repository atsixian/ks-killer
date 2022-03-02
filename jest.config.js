module.exports = {
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts', '!src/**/cli.ts', '!src/utils/test-helper/*.ts']
};
