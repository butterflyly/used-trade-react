
import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  // 현재 열려 있는 채팅방 목록
  const [openChats, setOpenChats] = useState([]);

  // 채팅방 열기
  const openChat = useCallback((roomId) => {
    const id = String(roomId);

    setOpenChats(prev => {
      // 이미 열려 있는 채팅방이면 새로 만들지 않고 복원
      const existing = prev.find(chat => chat.roomId === id);

      if (existing) {
        return prev.map(chat =>
          chat.roomId === id
            ? { ...chat, minimized: false }
            : chat
        );
      }

      // 새로운 채팅방 추가
      return [
        ...prev,
        {
          roomId: id,
          minimized: false
        }
      ];
    });
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
        closeAllChats
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Context 사용을 위한 커스텀 Hook
export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat은 ChatProvider 내부에서 사용해야 합니다.');
  }

  return context;
}
