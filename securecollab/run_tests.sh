#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running SecureCollab Test Suite${NC}"
echo "==============================================="

# Run frontend tests
echo -e "\n${YELLOW}Running Frontend Tests...${NC}"
cd /Users/sidousan/vibhathon/securecollab/src/frontend
echo "Installing necessary dependencies..."
npm install --save-dev @types/jest jest @testing-library/jest-dom @testing-library/react

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

# Update package.json test script temporarily
sed -i.bak 's/"test": "jest"/"test": "jest --config jest.config.cjs"/' package.json

echo "Running frontend tests..."
npm test
FRONTEND_EXIT_CODE=$?

# Restore original package.json
mv package.json.bak package.json

# Run backend tests
echo -e "\n${YELLOW}Running Backend Tests...${NC}"
cd /Users/sidousan/vibhathon/securecollab/src/backend
echo "Running cargo tests..."
cargo test
BACKEND_EXIT_CODE=$?

# Print summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "==============================================="
if [ $FRONTEND_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ Frontend tests passed${NC}"
else
  echo -e "${RED}✗ Frontend tests failed${NC}"
fi

if [ $BACKEND_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✓ Backend tests passed${NC}"
else
  echo -e "${RED}✗ Backend tests failed${NC}"
fi

# Overall status
if [ $FRONTEND_EXIT_CODE -eq 0 ] && [ $BACKEND_EXIT_CODE -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed successfully!${NC}"
  exit 0
else
  echo -e "\n${RED}Some tests failed. Please check the logs above for details.${NC}"
  exit 1
fi
