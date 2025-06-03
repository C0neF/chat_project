'use client';

import { useEffect, useRef } from 'react';
import Message from './Message';

interface MessageType {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageListProps {
  messages: MessageType[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={`flex-1 p-4 space-y-2 ${messages.length > 0 ? 'overflow-y-auto scrollbar-thin' : 'overflow-hidden'}`}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-2">开始对话</p>
            <p className="text-sm">发送消息开始聊天</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <Message
            key={message.id}
            id={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
