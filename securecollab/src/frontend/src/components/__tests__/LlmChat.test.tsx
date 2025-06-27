import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LlmChat } from '../LlmChat';
import { openaiService } from '../../services/openaiService';

// Mock the openai service
jest.mock('../../services/openaiService', () => ({
  openaiService: {
    prompt: jest.fn(),
    chat: jest.fn(),
  },
}));

describe('LlmChat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders chat interface correctly', () => {
    render(<LlmChat />);
    
    expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    expect(screen.getByText(/Send/i)).toBeInTheDocument();
  });

  test('sends a message and displays response', async () => {
    // Mock the prompt function to return a response
    (openaiService.prompt as jest.Mock).mockResolvedValue('This is a response from the LLM');
    
    render(<LlmChat />);
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByText(/Send/i);
    
    // Type a message
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello, LLM!' } });
    });
    
    // Send the message
    await act(async () => {
      fireEvent.click(sendButton);
    });
    
    // Wait for the response
    await waitFor(() => {
      expect(openaiService.prompt).toHaveBeenCalledWith('Hello, LLM!');
      expect(screen.getByText('Hello, LLM!')).toBeInTheDocument();
      expect(screen.getByText('This is a response from the LLM')).toBeInTheDocument();
    });
  });

  test('handles chat history correctly', async () => {
    // Mock the chat function to return a response
    (openaiService.chat as jest.Mock).mockResolvedValue('This is a response to your follow-up');
    
    render(<LlmChat />);
    
    // Add a message to the chat history
    const input = screen.getByPlaceholderText(/Type your message/i);
    
    // First message
    await act(async () => {
      fireEvent.change(input, { target: { value: 'First message' } });
      fireEvent.click(screen.getByText(/Send/i));
    });
    
    // Mock the first response
    (openaiService.prompt as jest.Mock).mockResolvedValue('First response');
    
    // Wait for the first response
    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument();
    });
    
    // Second message
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Follow-up question' } });
      fireEvent.click(screen.getByText(/Send/i));
    });
    
    // Wait for the second response
    await waitFor(() => {
      expect(openaiService.chat).toHaveBeenCalled();
      expect(screen.getByText('Follow-up question')).toBeInTheDocument();
      expect(screen.getByText('This is a response to your follow-up')).toBeInTheDocument();
    });
  });

  test('handles API errors when sending a message', async () => {
    // Mock the prompt function to reject with an error
    (openaiService.prompt as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<LlmChat />);
    
    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByText(/Send/i);
    
    // Type a message
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Test message' } });
    });
    
    // Send the message
    await act(async () => {
      fireEvent.click(sendButton);
    });
    
    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/i)).toBeInTheDocument();
    });
  });

  test('clears the input after sending a message', async () => {
    // Mock the prompt function
    (openaiService.prompt as jest.Mock).mockResolvedValue('Response');
    
    render(<LlmChat />);
    
    // Type a message
    const input = screen.getByPlaceholderText(/Type your message/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello, LLM!' } });
    });
    
    // Send the message
    const sendButton = screen.getByText(/Send/i);
    await act(async () => {
      fireEvent.click(sendButton);
    });
    
    // Check if the input is cleared
    expect(input).toHaveValue('');
  });
});
