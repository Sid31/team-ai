import axios from 'axios';

// Types for OpenAI API
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// OpenAI service configuration
const OPENAI_API_KEY = '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';
const DEFAULT_MODEL = 'gpt-4o';

// Create axios instance with authentication
const createOpenAIClient = () => {
  return axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    }
  });
};

export const openaiService = {
  /**
   * Send a single prompt to OpenAI
   * @param prompt The text prompt to send
   * @returns The generated response
   */
  async prompt(prompt: string): Promise<string> {
    try {
      const openaiClient = createOpenAIClient();
      const request: ChatCompletionRequest = {
        model: DEFAULT_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      };

      const response = await openaiClient.post<ChatCompletionResponse>(
        '/chat/completions',
        request
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to get response from OpenAI');
    }
  },

  /**
   * Send a chat conversation to OpenAI
   * @param messages Array of chat messages
   * @returns The generated response
   */
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const openaiClient = createOpenAIClient();
      const request: ChatCompletionRequest = {
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.7
      };

      const response = await openaiClient.post<ChatCompletionResponse>(
        '/chat/completions',
        request
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to get response from OpenAI');
    }
  }
};
