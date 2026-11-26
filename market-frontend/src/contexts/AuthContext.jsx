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
  redirectPath = null
) => {
  e?.preventDefault();

  if (confirmMessage && !window.confirm('로그아웃 하시겠습니까?')) {
    return;
  }

  // 로그아웃 버튼을 누른 현재 주소 저장
  const currentPath =
    window.location.pathname +
    window.location.search +
    window.location.hash;

  try {
    await Api.postRequest('/api/users/logout');

    setUser(null);
    setIsAuthenticated(false);

    // 별도 경로를 전달했다면 해당 경로, 아니면 현재 페이지
    const targetPath = redirectPath || currentPath;

    // 로그인 페이지 등으로 돌아가는 상황 방지
    if (targetPath.includes('/users/auth/login')) {
      window.location.href = '/service/items/list/1';
    } else {
      window.location.href = targetPath;
    }

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
