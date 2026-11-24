
import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import FloatingChatWindow from './FloatingChatWindow';

export default function FloatingChatContainer() {
  const { openChats } = useChat();

  return (
    <div className="floating-chat-container">
      {openChats.map((chat, index) => (
        <FloatingChatWindow
          key={chat.roomId}
          roomId={chat.roomId}
          minimized={chat.minimized}
          index={index}
        />
      ))}
    </div>
  );
}
