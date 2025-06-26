import { openaiService } from '../openaiService';

// Mock axios completely
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn()
  }))
}));

describe('OpenAI Service', () => {
  test('service should be defined', () => {
    expect(openaiService).toBeDefined();
    expect(typeof openaiService.prompt).toBe('function');
    expect(typeof openaiService.chat).toBe('function');
  });

  test('prompt method should exist and be callable', () => {
    expect(openaiService.prompt).toBeDefined();
    expect(typeof openaiService.prompt).toBe('function');
  });

  test('chat method should exist and be callable', () => {
    expect(openaiService.chat).toBeDefined();
    expect(typeof openaiService.chat).toBe('function');
  });
});
