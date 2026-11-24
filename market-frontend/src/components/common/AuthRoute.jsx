
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthRoute() {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <div>로그인 정보를 확인하고 있습니다...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/service/users/auth/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
