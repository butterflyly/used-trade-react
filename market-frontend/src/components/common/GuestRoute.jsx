
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function GuestRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div>로그인 정보를 확인하고 있습니다...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/service/items/list/1" replace />;
  }

  return <Outlet />;
}
