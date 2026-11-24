import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import MyReviews from './pages/review/MyReviews';
import SellerReviewList from './pages/review/SellerReviewList';
import ChatRoom from './pages/chat/ChatRoom';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider } from './contexts/ChatContext';
import GuestRoute from './components/common/GuestRoute'
import AuthRoute from './components/common/AuthRoute'


// Admin 컴포넌트들
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDeletedItemDetail from './pages/admin/AdminDeletedItemDetail';
import AdminDeletedItemList from './pages/admin/AdminDeletedItemList';
import AdminReportDetail from './pages/admin/AdminReportDetail';
import AdminReportList from './pages/admin/AdminReportList';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminUserList from './pages/admin/AdminUserList';
import AdminRoute from './components/common/AdminRoute';

// Users 활동/인증/프로필 컴포넌트들
import MyBuyItems from './pages/users/activities/MyBuyItems';
import MyChats from './pages/users/activities/MyChats';
import MyItemList from './pages/users/activities/MyItemList';
import MyLikeList from './pages/users/activities/MyLikeList';

import Login from './pages/users/auth/Login';
import Register from './pages/users/auth/Register';
import FindPassword from './pages/users/auth/FindPassword';
import FindUsername from './pages/users/auth/FindUsername';

import MyPage from './pages/users/profile/MyPage';
import UserUpdate from './pages/users/profile/UserUpdate';
import PasswordUpdate from './pages/users/profile/PasswordUpdate';
import WithdrawConfirm from './pages/users/profile/WithdrawConfirm';

// Items 상품 컴포넌트들
import ItemList from './pages/items/ItemList';
import ItemCreate from './pages/items/ItemCreate';
import ItemDetail from './pages/items/ItemDetail';
import ItemEdit from './pages/items/ItemEdit';

// 에러
import ErrorPage from './components/common/ErrorPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
       <ChatProvider>
           <Routes>
        {/* 공통 Layout을 부모로 두고, 그 안의 Outlet 자리에 자식 페이지들이 갈아 끼워집니다 */}
        <Route path="/" element={<Layout />}>
          
        {/* 부모에서 공통 주소를 한 번만 잡아줌 */}

          <Route path="service">

            <Route path="error/:status" element={<ErrorPage/>} />

            <Route path="reviews">
              <Route path="my" element={<MyReviews />} />
              <Route path="seller/:sellerId" element={<SellerReviewList />} />
            </Route>

            <Route path="chat">
              <Route path="room/:roomId" element={<ChatRoom />} />
            </Route>


            <Route element={<AdminRoute />}>
              <Route path="admin">
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="items/deleted-detail/:itemId" element={<AdminDeletedItemDetail />} />
                <Route path="items/deleted-list" element={<AdminDeletedItemList />} />
                <Route path="reports/detail/:id" element={<AdminReportDetail />} />
                <Route path="reports/list" element={<AdminReportList />} />
                <Route path="users/detail/:id" element={<AdminUserDetail />} />
                <Route path="users/list" element={<AdminUserList />} />
              </Route>
            </Route>
             

            {/* users를 부모로 하는 공통 그룹화 */}
            <Route path="users">

              {/* 1. auth (인증/계정 찾기/로그인) 그룹 */}
              <Route element={<GuestRoute />}>
                <Route path="auth">
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="find-password" element={<FindPassword />} />
                  <Route path="find-username" element={<FindUsername />} />
               </Route>
              </Route>
              
              
              {/* 2. activities (활동 관련) 그룹 */}
              <Route element={<AuthRoute/>}>
                <Route path="activities">
                  <Route path="buy-items" element={<MyBuyItems />} />
                  <Route path="chats" element={<MyChats />} />
                  <Route path="item-list" element={<MyItemList />} />
                  <Route path="like-list" element={<MyLikeList />} />
              </Route>

                {/* 3. profile (마이페이지 및 정보 수정) 그룹 */}
                <Route path="profile">
                  <Route path="mypage" element={<MyPage />} />
                  <Route path="update" element={<UserUpdate />} />
                  <Route path="password-update" element={<PasswordUpdate />} />
                  <Route path="withdraw" element={<WithdrawConfirm />} />
                </Route>
              </Route>
            </Route>

            {/* items를 부모로 하는 상품 도메인 그룹 */}
            <Route path="items">
              {/* /service/items/list 로 바로 접근 시 기본 카테고리(예: 1번)로 리다이렉트 */}
              <Route index element={<Navigate to="list/1" replace />} />
              <Route path="list/:id" element={<ItemList />} />
              <Route path="create" element={<ItemCreate />} />
              <Route path="detail/:itemId" element={<ItemDetail />} />
              <Route path="edit/:itemId" element={<ItemEdit />} />
            </Route>

          </Route>

        </Route>
      </Routes>
        </ChatProvider>
      </AuthProvider>
  
    </BrowserRouter>
  );
}

export default App;