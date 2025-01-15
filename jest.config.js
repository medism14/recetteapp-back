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
    '@prisma/prisma.service': '<rootDir>/prisma/prisma.service',
    '^@/(.*)$': '<rootDir>/$1',
    '^prisma/(.*)$': '<rootDir>/../prisma/$1'
  },
};
