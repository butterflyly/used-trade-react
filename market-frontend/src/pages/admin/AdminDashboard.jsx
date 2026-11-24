import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar'; // 아까 만든 사이드바 import
import Api from '../../api/api';


export default function AdminDashboard() {
  
  // 통계 수치 상태 관리
  const [stats, setStats] = useState({
    pendingReportCount: 0,
    deletedItemCount: 0,
    blackUserCount: 0
  });
  const [loading, setLoading] = useState(true);

  // 대시보드 진입 시 통계 데이터를 불러오는 API 호출
  useEffect(() => {
    fetchDashboardStats();
  }, []);

 const fetchDashboardStats = async () => {
  try {
      const res = await Api.formRequest(
        '/api/view/admin/dashboard',
        null,
        'GET'
      );

      if (res && res.isAvailable) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("대시보드 통계 데이터를 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center my-5">관리자 대시보드 로딩 중...</div>;
  }

  return (
    <div className="container my-5">
      {/* 상단 헤더 영역 */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <span className="badge bg-danger mb-1">ADMIN ONLY</span>
          <h1 className="h2 fw-bold mb-0 text-dark">⚙️ 시스템 통합 대시보드</h1>
        </div>
        <div className="text-muted small">
          <i className="bi bi-shield-fill-check text-success"></i> 최고 관리자 세션 활성화 중
        </div>
      </div>

      <div className="row g-4">
        {/* 좌측 사이드바 영역 */}
        <div className="col-md-3">
          <AdminSidebar />
        </div>

        {/* 우측 메인 콘텐츠 영역 */}
        <div className="col-md-9">
          <div className="row g-3 mb-4">
            
            {/* 1. 미처리 신고 카드 */}
            <div className="col-md-4">
              <div className="card stat-card border-0 shadow-sm p-4 bg-white rounded">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted fw-bold small text-uppercase mb-2">미처리 신고</h6>
                    <div className="d-flex align-items-baseline">
                      <span className="display-6 fw-bold text-danger me-1">{stats.pendingReportCount}</span>
                      <span className="text-muted small">건</span>
                    </div>
                  </div>
                  <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 fs-3 d-flex align-items-center justify-content-center" style={{ width: '55px', height: '55px' }}>
                    <i className="bi bi-bell-fill"></i>
                  </div>
                </div>
                <div className="border-top mt-3 pt-2 text-end">
                  <Link to="/admin/reports" className="text-decoration-none text-primary fw-medium" style={{ fontSize: '0.85rem' }}>
                    처리 대기열 이동 ➔
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. 아카이브 삭제글 카드 */}
            <div className="col-md-4">
              <div className="card stat-card border-0 shadow-sm p-4 bg-white rounded">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted fw-bold small text-uppercase mb-2">아카이브 삭제글</h6>
                    <div className="d-flex align-items-baseline">
                      <span className="display-6 fw-bold text-secondary me-1">{stats.deletedItemCount}</span>
                      <span className="text-muted small">개</span>
                    </div>
                  </div>
                  <div className="bg-secondary bg-opacity-10 text-secondary rounded-circle p-3 fs-3 d-flex align-items-center justify-content-center" style={{ width: '55px', height: '55px' }}>
                    <i className="bi bi-archive-fill"></i>
                  </div>
                </div>
                <div className="border-top mt-3 pt-2 text-end">
                  <Link to="/admin/items/deleted-list" className="text-decoration-none text-primary fw-medium" style={{ fontSize: '0.85rem' }}>
                    보관함 열기 ➔
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. 제재 블랙 유저 카드 */}
            <div className="col-md-4">
              <div className="card stat-card border-0 shadow-sm p-4 bg-white rounded">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted fw-bold small text-uppercase mb-2">제재 블랙 유저</h6>
                    <div className="d-flex align-items-baseline">
                      <span className="display-6 fw-bold text-warning me-1">{stats.blackUserCount}</span>
                      <span className="text-muted small">명</span>
                    </div>
                  </div>
                  <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 fs-3 d-flex align-items-center justify-content-center" style={{ width: '55px', height: '55px' }}>
                    <i className="bi bi-person-x-fill"></i>
                  </div>
                </div>
                <div className="border-top mt-3 pt-2 text-end">
                  <Link to="/admin/users?tab=BLACK" className="text-decoration-none text-primary fw-medium" style={{ fontSize: '0.85rem' }}>
                    리스트 모니터링 ➔
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* 안내사항 카드 */}
          <div className="card border-0 shadow-sm p-4 bg-white rounded">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-info-circle-fill text-primary me-2"></i>어드민 마스터 안내사항
            </h5>
            <p className="text-secondary mb-0 small" style={{ lineHeight: '1.6' }}>
              본 대시보드는 중고거래 플랫폼의 실시간 상태를 모니터링하기 위한 관리자 전용 아카이브 공간입니다.<br />
              좌측 메뉴를 이용하여 <strong>신고된 유해 게시물 처리, 논리 삭제(Soft-Delete)된 게시물 상세 복원/조회, 악성 이용자 제재 관리</strong>를 원스톱으로 처리할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}