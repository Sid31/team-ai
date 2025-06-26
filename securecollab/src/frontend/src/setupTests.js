// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Mock the IC Actor and related modules
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
}, { virtual: true });

// Mock the Principal
jest.mock('@dfinity/principal', () => {
  return {
    Principal: {
      fromText: jest.fn(() => 'mocked-principal'),
      anonymous: jest.fn(() => 'anonymous-principal'),
    },
  };
}, { virtual: true });
