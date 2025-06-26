#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running SecureCollab Frontend Tests${NC}"
echo "==============================================="

cd /Users/sidousan/vibhathon/securecollab/src/frontend

# Create a temporary jest.config.cjs file for CommonJS compatibility
cat > jest.config.cjs << EOL
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/vite-env.d.ts'
  ]
}
EOL

# Create CommonJS versions of the mock files
mkdir -p __mocks__
cat > __mocks__/fileMock.js << EOL
module.exports = 'test-file-stub';
EOL

cat > __mocks__/styleMock.js << EOL
module.exports = {};
EOL

# Create a CommonJS setup file
cat > src/setupTests.js << EOL
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Mock the IC Actor
jest.mock('@dfinity/agent', () => {
  return {
    Actor: {
      createActor: jest.fn(() => ({
        prompt: jest.fn(),
        chat: jest.fn(),
        getAvailableAgents: jest.fn(),
        deployMpcAgents: jest.fn(),
        uploadPrivateData: jest.fn(),
        getDataSourcesForUser: jest.fn(),
        executePrivateComputation: jest.fn(),
        generatePrivacyProof: jest.fn(),
      })),
    },
    HttpAgent: jest.fn(() => ({
      fetchRootKey: jest.fn(),
    })),
  };
});

// Mock the Principal
jest.mock('@dfinity/principal', () => {
  return {
    Principal: {
      fromText: jest.fn(() => 'mocked-principal'),
      anonymous: jest.fn(() => 'anonymous-principal'),
    },
  };
});
EOL

# Update package.json test script temporarily
sed -i.bak 's/"test": "jest"/"test": "jest --config jest.config.cjs"/' package.json

echo "Running frontend tests..."
npm test

# Restore original package.json
mv package.json.bak package.json

# Print summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "==============================================="
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Frontend tests passed${NC}"
  exit 0
else
  echo -e "${RED}✗ Frontend tests failed${NC}"
  exit 1
fi
