// Phase 6: Bambai AI Assistant Chat Widget

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatResponse } from '../types';

interface ChatWidgetProps {
  apiEndpoint?: string;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  title?: string;
  subtitle?: string;
  placeholder?: string;
  enableVoice?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiEndpoint = '/api/chatbot/ask',
  theme = 'light',
  position = 'bottom-right',
  title = 'Bambai AI Assistant',
  subtitle = 'Your chess companion',
  placeholder = 'Ask me anything about chess or TheChessWire...',
  enableVoice = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      sessionId,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          voiceMode: enableVoice,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: ChatMessage = {
        id: data.messageId,
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp,
        sessionId,
        metadata: {
          confidence: data.metadata.confidence,
          tools: data.metadata.tools,
          tokens: data.metadata.tokens,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Sorry, I\'m having trouble connecting right now. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I\'m experiencing technical difficulties. Please try again in a moment.',
        timestamp: new Date(),
        sessionId,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getThemeClasses = () => {
    return theme === 'dark' 
      ? 'bg-gray-900 text-white border-gray-700' 
      : 'bg-white text-gray-900 border-gray-200 shadow-lg';
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {/* Chat Widget */}
      {isOpen && (
        <div className={`w-80 h-96 rounded-lg border ${getThemeClasses()} flex flex-col`}>
          {/* Header */}
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {subtitle}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Clear chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  title="Close chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm">Hello! I'm Bambai AI, your chess assistant.</p>
                <p className="text-xs mt-1">Ask me anything about chess or TheChessWire!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.role === 'user'
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="max-w-xs px-3 py-2 rounded-lg text-sm bg-red-100 text-red-800">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={isLoading}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  isLoading || !inputMessage.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget; 