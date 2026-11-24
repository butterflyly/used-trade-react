
import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatRoom from '../../pages/chat/ChatRoom';
import '../../styles/floatingChat.css';

export default function FloatingChatWindow({
  roomId,
  minimized,
  index
}) {
  const { toggleMinimize, closeChat } = useChat();

  return (
    <div
      className={`floating-chat-window ${minimized ? 'minimized' : ''}`}
      style={{
        right: `${index * 350 + 20}px`,
        zIndex: 1000 + index
      }}
    >
      {/* 채팅 창 상단 컨트롤 */}
      <div className="floating-chat-header">
        <span>
          채팅방 #{roomId}
        </span>

        <div className="floating-chat-controls">
          <button
            type="button"
            onClick={() => toggleMinimize(roomId)}
            title={minimized ? '복원' : '최소화'}
          >
            {minimized ? '□' : '－'}
          </button>

          <button
            type="button"
            onClick={() => closeChat(roomId)}
            title="닫기"
          >
            ×
          </button>
        </div>
      </div>

      {/* 최소화 상태에서는 채팅 내용 숨김 */}
      {!minimized && (
       <div
            className="floating-chat-body"
            style={{ display: minimized ? 'none' : 'block' }}
            >
            <ChatRoom roomId={roomId} floating={true} />
            </div>
      )}
    </div>
  );
}
