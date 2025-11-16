import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '@google/genai';
import { createChatSession } from './services/geminiService';
import { Message, Role, Source } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { SunIcon, MoonIcon, ExitIcon } from './components/Icons';

const INITIAL_MESSAGE: Message = {
  id: uuidv4(),
  role: Role.MODEL,
  text: "Hello! I'm EVy, your expert AI assistant for everything related to Tesla, EVs, and sustainability. How can I help you today?",
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return 'dark';
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = sessionStorage.getItem('chatHistory');
      return savedMessages ? JSON.parse(savedMessages) : [INITIAL_MESSAGE];
    } catch (error) {
      console.error("Failed to parse chat history from sessionStorage", error);
      return [INITIAL_MESSAGE];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession();
    } catch (e: any) {
      setError("Failed to initialize chat session. Please check your API key.");
      console.error(e);
    }
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history to sessionStorage", error);
    }
  }, [messages]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleExit = () => {
    // Note: window.close() may not work in all browsers or contexts due to security policies.
    window.close();
  };

  const handleSendMessage = async (userMessage: string) => {
    if (!chatSessionRef.current) {
        setError("Chat session is not initialized.");
        return;
    }

    setIsLoading(true);
    setError(null);

    const newUserMessage: Message = {
      id: uuidv4(),
      role: Role.USER,
      text: userMessage,
    };

    const modelResponseId = uuidv4();
    const modelResponsePlaceholder: Message = {
      id: modelResponseId,
      role: Role.MODEL,
      text: '...',
    };
    
    setMessages(prev => [...prev, newUserMessage, modelResponsePlaceholder]);
    
    try {
      const stream = await chatSessionRef.current.sendMessageStream({ message: userMessage });

      let fullResponse = '';
      let sources: Source[] = [];
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        
        const chunkSources = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunkSources) {
           sources = chunkSources
            .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
            .map((chunk: any) => ({
              uri: chunk.web.uri,
              title: chunk.web.title,
            }));
        }

        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelResponseId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
      
      if (sources.length > 0) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelResponseId ? { ...msg, text: fullResponse, sources } : msg
          )
        );
      }

    } catch (e: any) {
      const errorMessage = "Sorry, something went wrong. Please try again.";
      setError(errorMessage);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === modelResponseId ? { ...msg, text: errorMessage } : msg
        )
      );
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen font-sans ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`flex items-center justify-between p-4 border-b shadow-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex-1"></div>
        <h1 className="text-2xl font-bold text-center flex-1">EV Expert Chat</h1>
        <div className="flex-1 flex justify-end items-center gap-2">
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`} aria-label="Toggle theme">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button onClick={handleExit} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700 hover:text-red-500' : 'text-red-500 hover:bg-gray-200 hover:text-red-600'}`} aria-label="Exit">
                <ExitIcon />
            </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} theme={theme} />
          ))}
          <div ref={messagesEndRef} />
        </div>
         {error && <div className="text-red-500 text-center mt-4">{error}</div>}
      </main>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} theme={theme} />
    </div>
  );
}

export default App;