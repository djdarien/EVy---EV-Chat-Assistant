
import React from 'react';
import { Message, Role } from '../types';
import { BotIcon, UserIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === Role.MODEL;

  return (
    <div className={`flex items-start gap-4 my-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
      {isModel && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
          <BotIcon />
        </div>
      )}
      <div
        className={`max-w-xl p-4 rounded-lg shadow-md ${
          isModel ? 'bg-gray-700 text-gray-200' : 'bg-blue-600 text-white'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
      {!isModel && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
