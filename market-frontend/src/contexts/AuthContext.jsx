import React, { createContext, useContext, useEffect, useState } from 'react';
import Api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 로그인 상태 및 사용자 정보 조회
  const checkLoginStatus = async () => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include'
      });

      if (res.ok) {
        const result = await res.json();

        if (result && result.isAvailable && result.data) {
          setUser(result.data);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('인증 체크 실패:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 로그아웃
  const handleLogout = async (
    e,
    confirmMessage = true,
    redirectPath = '/service/items/list/1'
  ) => {
    e?.preventDefault();

    if (confirmMessage && !window.confirm('로그아웃 하시겠습니까?')) {
      return;
    }

    try {
      await Api.postRequest('/api/users/logout');

      setUser(null);
      setIsAuthenticated(false);

      window.location.href = redirectPath;
    } catch (error) {
      console.error('로그아웃 처리 중 에러:', error);
      window.location.reload();
    }
  };

  // 앱 최초 실행 시 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const value = {
    user,
    setUser,
    isAuthenticated,
    isAuthLoading,
    checkLoginStatus,
    handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 다른 컴포넌트에서 인증 정보 사용
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.');
  }

  return context;
}
