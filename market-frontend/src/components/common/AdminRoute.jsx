import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function AdminRoute() {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return <Navigate to="/service/users/auth/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/service/error/403" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;