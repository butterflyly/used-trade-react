
import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import '../../styles/floatingChat.css';


export default function ChatLauncher() {
  const { isChatListOpen, toggleChatList } = useChat();

  return (
    <button
      type="button"
      className="chat-launcher"
      onClick={toggleChatList}
      title="채팅"
    >
      <i className={`bi ${isChatListOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`}></i>
    </button>
  );
}
