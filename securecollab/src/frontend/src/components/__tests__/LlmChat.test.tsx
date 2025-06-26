// React is used implicitly in JSX
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LlmChat } from '../LlmChat';
import { openaiService } from '../../services/openaiService';

// Mock the OpenAI service
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

  test('renders the LLM chat interface', () => {
    render(<LlmChat />);
    
    expect(screen.getByText(/LLM Chat/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    expect(screen.getByText(/Send/i)).toBeInTheDocument();
  });

  test('sends a prompt and displays the response', async () => {
    // Mock the prompt function to return a response
    (openaiService.prompt as jest.Mock).mockResolvedValue('This is a response from the LLM');
    
    render(<LlmChat />);
    
    // Type a message
    const input = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(input, { target: { value: 'Hello, LLM!' } });
    
    // Send the message
    const sendButton = screen.getByText(/Send/i);
    fireEvent.click(sendButton);
    
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
    fireEvent.change(input, { target: { value: 'First message' } });
    fireEvent.click(screen.getByText(/Send/i));
    
    // Mock the first response
    (openaiService.prompt as jest.Mock).mockResolvedValue('First response');
    
    // Wait for the first response
    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument();
    });
    
    // Second message
    fireEvent.change(input, { target: { value: 'Follow-up question' } });
    fireEvent.click(screen.getByText(/Send/i));
    
    // Wait for the second response
    await waitFor(() => {
      expect(openaiService.chat).toHaveBeenCalled();
      expect(screen.getByText('Follow-up question')).toBeInTheDocument();
      expect(screen.getByText('This is a response to your follow-up')).toBeInTheDocument();
    });
  });

  test('handles errors when the LLM call fails', async () => {
    // Mock the prompt function to reject with an error
    (openaiService.prompt as jest.Mock).mockRejectedValue(new Error('Failed to get LLM response'));
    
    render(<LlmChat />);
    
    // Type a message
    const input = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(input, { target: { value: 'Hello, LLM!' } });
    
    // Send the message
    const sendButton = screen.getByText(/Send/i);
    fireEvent.click(sendButton);
    
    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  test('clears the input after sending a message', async () => {
    // Mock the prompt function
    (openaiService.prompt as jest.Mock).mockResolvedValue('Response');
    
    render(<LlmChat />);
    
    // Type a message
    const input = screen.getByPlaceholderText(/Type your message/i);
    fireEvent.change(input, { target: { value: 'Hello, LLM!' } });
    
    // Send the message
    const sendButton = screen.getByText(/Send/i);
    fireEvent.click(sendButton);
    
    // Check if the input is cleared
    expect(input).toHaveValue('');
  });
});
