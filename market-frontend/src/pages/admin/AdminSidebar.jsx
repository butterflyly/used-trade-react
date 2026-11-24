import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  // 현재 브라우저의 URL 경로를 가져오는 리액트 라우터 훅
  const location = useLocation();
  const currentPath = location.pathname;

  // 관리자 메뉴 목록 데이터 배열
  const menuItems = [
    {
      label: "대시보드 홈",
      path: "/service/admin/dashboard",
      pattern: /^\/service\/admin\/dashboard$/,
      icon: "bi bi-speedometer2 me-2"
    },
    {
      label: "신고 내역 관리",
      path: "/service/admin/reports/list",
      pattern: /^\/service\/admin\/reports\/list/,
      icon: "bi bi-exclamation-triangle me-2 text-danger"
    },
    {
      label: "삭제글 아카이브",
      path: "/service/admin/items/deleted-list",
      pattern: /^\/service\/admin\/items\/deleted-list/,
      icon: "bi bi-trash-fill me-2 text-secondary"
    },
    {
      label: "회원 모니터링",
      path: "/service/admin/users/list",
      pattern: /^\/service\/admin\/users\/list/,
      icon: "bi bi-people-fill me-2 text-primary"
    }
  ];

  return (
    <div className="card border-0 shadow-sm p-3 bg-white rounded">
      <div className="fw-bold text-secondary small px-2 mb-3 text-uppercase">관리 메뉴 목록</div>
      <div className="nav flex-column gap-1" id="adminSidebarMenu">
        {menuItems.map((item, index) => {
          // 정규식과 현재 경로를 비교하여 active 여부 판별
          const isActive = item.pattern.test(currentPath);

          return (
            <Link
              key={index}
              to={item.path}
              // active 상태일 때 Bootstrap의 'active' 클래스를 동적으로 주입
              className={`nav-link admin-nav-link px-3 py-2 text-dark ${isActive ? 'active' : ''}`}
            >
              <i className={item.icon}></i> {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}