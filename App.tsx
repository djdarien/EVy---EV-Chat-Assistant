
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Chat } from '@google/genai';
import { createChatSession } from './services/geminiService';
import { Message, Role } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: Role.MODEL,
      text: "Hello! I'm EVy, your expert AI assistant for everything related to Tesla, EVs, and sustainability. How can I help you today?",
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelResponseId ? { ...msg, text: fullResponse } : msg
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
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className="p-4 bg-gray-800 border-b border-gray-700 shadow-md">
        <h1 className="text-2xl font-bold text-center">EV Expert Chat</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
         {error && <div className="text-red-500 text-center mt-4">{error}</div>}
      </main>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}

export default App;
