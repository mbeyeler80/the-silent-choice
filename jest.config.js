module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/tests/**/*.test.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/desktop/out/',
    '<rootDir>/desktop/dist-windows-web/',
  ],
};
