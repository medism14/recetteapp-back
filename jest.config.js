module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@prisma/(.*)$': '<rootDir>/../node_modules/@prisma/$1',
    '^prisma/(.*)$': '<rootDir>/../prisma/$1'
  },
  moduleDirectories: ['node_modules', '<rootDir>/../'],
  setupFilesAfterEnv: ['<rootDir>/../jest.setup.ts'],
}; 