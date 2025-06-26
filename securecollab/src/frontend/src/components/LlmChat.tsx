import React, { useState } from 'react';
import { Button, Loader } from './';
import { openaiService } from '../services/openaiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const LlmChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message to the chat
    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      let response: string;
      
      // If this is the first message, use prompt, otherwise use chat
      if (messages.length === 0) {
        response = await openaiService.prompt(inputValue);
      } else {
        // Convert our messages to the format expected by the OpenAI API
        const chatMessages = [
          ...messages,
          userMessage
        ].map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        response = await openaiService.chat(chatMessages);
      }

      // Add assistant response to the chat
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Failed to get response from LLM'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 shadow-sm rounded-lg mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">LLM Chat</h2>
        <p className="text-gray-600">
          Chat with our AI assistant powered by OpenAI's GPT-4o model.
        </p>
      </div>

      <div className="flex-grow bg-white p-4 shadow-sm rounded-lg mb-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-100 ml-12'
                    : 'bg-gray-100 mr-12'
                }`}
              >
                <p className="text-sm font-semibold mb-1">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center my-4">
            <Loader />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white p-4 shadow-sm rounded-lg">
        <div className="flex space-x-2">
          <textarea
            className="flex-grow border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message here..."
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
