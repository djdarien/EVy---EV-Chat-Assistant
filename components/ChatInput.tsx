import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, MicrophoneIcon, StopIcon } from './Icons';

// Fix: Add type definitions for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, theme }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);
  
  const handleVoiceClick = () => {
    if (!recognitionRef.current) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  const canUseVoice = !!recognitionRef.current;
  const loadingPulseClass = isLoading ? 'animate-pulse ring-2 ring-blue-500/50' : '';

  return (
    <form onSubmit={handleSubmit} className={`p-4 border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about Tesla, EVs, batteries..."
          disabled={isLoading}
          className={`w-full px-4 py-3 pr-24 border rounded-full focus:outline-none focus:ring-2 disabled:opacity-50 transition-shadow ${
            theme === 'dark'
              ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500'
              : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500'
          } ${loadingPulseClass}`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <button
                type="button"
                onClick={handleVoiceClick}
                disabled={isLoading || !canUseVoice}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  theme === 'dark' 
                    ? 'text-white hover:bg-gray-600 disabled:text-gray-500'
                    : 'text-gray-600 hover:bg-gray-300 disabled:text-gray-400'
                } disabled:cursor-not-allowed`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
                {isRecording ? <StopIcon /> : <MicrophoneIcon />}
            </button>
            <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <SendIcon />
                )}
            </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;