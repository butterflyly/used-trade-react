import React from 'react';
import { Outlet } from 'react-router-dom'; // 아래쪽 빈 구멍(Outlet)에는 주소에 맞는 페이지를 끼워넣기
import Navbar from './Navbar'; // 네비게이션바 컴포넌트
import '../../assets/css/layout.css';
import FloatingChatContainer from '../chat/FloatingChatContainer';
import ChatLauncher from '../chat/ChatLauncher';
import ChatListPanel from '../chat/ChatListPanel';

function Layout() {
  return (
    <div>
      {/* 1. 상단 네비게이션바 고정 */}
      <Navbar />

      {/* 2. 주소에 따라 바뀌는 알맹이(페이지 내용)가 쏙 들어가는 구멍 */}
      <main className="container my-4">
        <Outlet />
      </main>

        <ChatListPanel />
       <ChatLauncher />
       <FloatingChatContainer />
    </div>
  );
}

export default Layout;