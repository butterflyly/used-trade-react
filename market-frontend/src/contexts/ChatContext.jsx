import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [openChats, setOpenChats] = useState([]);

  // 채팅 목록 표시 여부
  const [isChatListOpen, setIsChatListOpen] = useState(false);

  // 채팅 목록 열기 / 닫기
  const toggleChatList = useCallback(() => {
    setIsChatListOpen(prev => !prev);
  }, []);

  // 채팅방 열기
  const openChat = useCallback((roomId) => {
    const id = String(roomId);

    setOpenChats(prev => {
      const existing = prev.find(chat => chat.roomId === id);

      if (existing) {
        return prev.map(chat =>
          chat.roomId === id
            ? { ...chat, minimized: false }
            : chat
        );
      }

      return [
        ...prev,
        {
          roomId: id,
          minimized: false
        }
      ];
    });

    setIsChatListOpen(false);
  }, []);

  // 채팅방 최소화 / 복원
  const toggleMinimize = useCallback((roomId) => {
    setOpenChats(prev =>
      prev.map(chat =>
        chat.roomId === String(roomId)
          ? { ...chat, minimized: !chat.minimized }
          : chat
      )
    );
  }, []);

  // 채팅방 최소화
  const minimizeChat = useCallback((roomId) => {
    setOpenChats(prev =>
      prev.map(chat =>
        chat.roomId === String(roomId)
          ? { ...chat, minimized: true }
          : chat
      )
    );
  }, []);

  // 채팅방 닫기
  const closeChat = useCallback((roomId) => {
    setOpenChats(prev =>
      prev.filter(chat => chat.roomId !== String(roomId))
    );
  }, []);

  // 모든 채팅방 닫기
  const closeAllChats = useCallback(() => {
    setOpenChats([]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        openChats,
        openChat,
        toggleMinimize,
        minimizeChat,
        closeChat,
        closeAllChats,
        isChatListOpen,
        toggleChatList
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat은 ChatProvider 내부에서 사용해야 합니다.');
  }

  return context;
}