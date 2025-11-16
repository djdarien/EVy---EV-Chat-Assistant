import React from 'react';
import { Message, Role } from '../types';
import { BotIcon, UserIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
  theme: 'light' | 'dark';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, theme }) => {
  const isModel = message.role === Role.MODEL;

  const modelBubbleClasses = theme === 'dark'
    ? 'bg-gray-700 text-gray-200'
    : 'bg-gray-200 text-gray-800';
  
  const userBubbleClasses = theme === 'dark'
    ? 'bg-blue-600 text-white'
    : 'bg-blue-500 text-white';
  
  const modelIconBg = theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400';
  const userIconBg = theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400';

  return (
    <div className={`flex items-start gap-4 my-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
      {isModel && (
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${modelIconBg} flex items-center justify-center`}>
          <BotIcon />
        </div>
      )}
      <div
        className={`max-w-xl p-4 rounded-lg shadow-md flex flex-col gap-2 ${
          isModel ? modelBubbleClasses : userBubbleClasses
        }`}
      >
        <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: message.text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>').replace(/(\*|_)(.*?)\1/g, '<em>$2</em>') }}></p>
        {message.sources && message.sources.length > 0 && (
          <div className={`mt-2 border-t pt-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
            <h4 className={`text-xs font-bold mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Sources:</h4>
            <ul className="list-disc list-inside text-sm">
              {message.sources.map((source, index) => (
                <li key={index}>
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {!isModel && (
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${userIconBg} flex items-center justify-center`}>
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;