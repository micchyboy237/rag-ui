// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest", // Use ts-jest preset for TypeScript compatibility
  testEnvironment: "jsdom", // Suitable for testing React components
  roots: ["<rootDir>/app"], // Test files are located under the `app` directory
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Transform TypeScript files using ts-jest
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"], // Recognize these file types
  testMatch: ["<rootDir>/app/**/*.(test|spec).(ts|tsx|js|jsx)"], // Match test files in __tests__ folder or with .test/.spec
  collectCoverage: true, // Enable coverage reporting
  coverageDirectory: "<rootDir>/coverage", // Directory for coverage reports
  coverageReporters: ["text", "lcov"], // Generate text and lcov coverage reports
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/app/$1", // Mock ./app/*
    "\\.(css|less|sass|scss)$": "identity-obj-proxy", // Mock CSS modules
    "\\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|otf)$":
      "<rootDir>/__mocks__/fileMock.js", // Mock static assets
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"], // Treat TypeScript files as ESM
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

module.exports = config;
