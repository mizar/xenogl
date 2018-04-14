module.exports = {
  "transform": {
    "^.+\\.tsx?$": "ts-jest",
  },
  "testMatch": ["**/__tests__/**/*.test.(ts|js)?(x)"],
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node",
  ],
  "coverageThreshold": {
    "global": {
      "branches": -1,
      "functions": -1,
      "lines": -1,
      "statements": -1,
    },
  },
  "collectCoverage": true,
  "collectCoverageFrom": [
    "src/**",
  ],
};
