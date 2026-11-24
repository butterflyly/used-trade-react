import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Api from '../../api/api';


export default function AdminUserList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 쿼리 파라미터에서 현재 tab, keyword, page 추출 (기본값 tab='ALL', keyword='', page=0)
  const currentTab = searchParams.get('tab') || 'ALL';
  const keyword = searchParams.get('keyword') || '';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const [preservedTab, setPreservedTab] = useState('ALL');


  // 로컬 검색 입력창 상태 (타이핑하는 동안 유지)
  const [searchInput, setSearchInput] = useState(keyword);

  // 서버에서 받아올 페이징 및 유저 데이터 상태
  const [pageData, setPageData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    first: true,
    last: true
  });
  const [loading, setLoading] = useState(true);

  // tab, keyword, page가 바뀔 때마다 백엔드 유저 목록 API 호출
 useEffect(() => {
    fetchUsers();
    setSearchInput(keyword);
  }, [currentTab, keyword, page, preservedTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await Api.formRequest(
        `/api/view/admin/users?tab=${currentTab}&keyword=${encodeURIComponent(keyword)}&page=${page}&preserved=${preservedTab}`,
        null,
        'GET'
        );if (res && res.isAvailable) {
        setPageData(res.data);
      }
    } catch (error) {
      console.error("유저 목록 데이터를 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 폼 제출 핸들러
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // 검색 시 항상 0페이지부터 시작하도록 쿼리 갱신 (현재 탭 유지)
    setSearchParams({ tab: currentTab, keyword: searchInput, page: 0 });
  };

  // 탭 변경 핸들러 (탭 누를 시 검색어는 유지하되 0페이지부터 시작)
  const handleTabChange = (tabName) => {
    setPreservedTab('ALL');
    setSearchParams({ tab: tabName, keyword: keyword, page: 0 });
  };
  
  // 페이지네이션 번호 클릭 핸들러
  const handlePageChange = (targetPage) => {
    setSearchParams({ tab: currentTab, keyword: keyword, page: targetPage });
  };

  return (
    <div className="container my-5">
      <div className="row g-4">
        {/* 좌측 관리자 사이드바 */}
        <div className="col-md-3">
          <AdminSidebar />
        </div>

        {/* 우측 메인 컨텐츠 영역 */}
        <div className="col-md-9">
          {/* 상단 타이틀 */}
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
            <div>
              <h1 className="h3 mb-1 text-dark fw-bold">
                <i className="bi bi-people-fill text-primary"></i> 유저 관리 및 권한 제재 센터
              </h1>
              <small className="text-muted">블랙리스트 회원 및 탈퇴(소프트 삭제) 유저들을 통합 추적하고 복구 민원을 처리하는 공간입니다.</small>
            </div>
          </div>

          {/* 통합 필터 검색 바 */}
          <div className="card shadow-sm border-0 mb-4 bg-white">
            <div className="card-body p-3 bg-light rounded border">
              <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
                <div className="col-md-9">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      <i className="bi bi-search"></i>
                    </span>
                    <input 
                      type="text" 
                      name="keyword" 
                      className="form-control border-start-0 ps-0"
                      placeholder="고객센터 접수용 이메일, 계정 ID, 혹은 유저 닉네임을 입력해 검색하세요..." 
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <button type="submit" className="btn btn-primary w-100 fw-bold">
                    <i className="bi bi-funnel-fill"></i> 통합 필터 검색
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 상단 상태 탭 메뉴 */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                type="button"
                className={`nav-link fw-bold px-4 border-0 bg-transparent ${currentTab === 'ALL' ? 'active text-primary border-bottom border-primary border-3' : 'text-secondary'}`}
                onClick={() => handleTabChange('ALL')}
              >
                📦 전체 대상 관리 {currentTab === 'ALL' && <span className="badge bg-dark ms-1">{pageData.totalElements}</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                type="button"
                className={`nav-link fw-bold px-4 border-0 bg-transparent ${currentTab === 'BLACK' ? 'active text-danger border-bottom border-danger border-3' : 'text-secondary'}`}
                onClick={() => handleTabChange('BLACK')}
              >
                🚫 블랙 유저 명단 {currentTab === 'BLACK' && <span className="badge bg-danger ms-1">{pageData.totalElements}</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                type="button"
                className={`nav-link fw-bold px-4 border-0 bg-transparent ${currentTab === 'DELETED' ? 'active text-warning text-dark border-bottom border-warning border-3' : 'text-secondary'}`}
                onClick={() => handleTabChange('DELETED')}
              >
                🗑️ 소프트 삭제(탈퇴) {currentTab === 'DELETED' && <span className="badge bg-warning text-dark ms-1">{pageData.totalElements}</span>}
              </button>
            </li>
          </ul>

          {/* 소프트 삭제 회원 전용 하위 탭 */}
          {currentTab === 'DELETED' && (
            <ul className="nav nav-pills mb-3">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${preservedTab === 'ALL' ? 'active' : ''}`}
                  onClick={() => setPreservedTab('ALL')}
                >
                  전체
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${preservedTab === 'FALSE' ? 'active' : ''}`}
                  onClick={() => setPreservedTab('FALSE')}
                >
                  자동 삭제 대기
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${preservedTab === 'TRUE' ? 'active' : ''}`}
                  onClick={() => setPreservedTab('TRUE')}
                >
                  영구 보존
                </button>
              </li>
            </ul>
          )}

          {/* 유저 목록 테이블 */}
          <div className="table-responsive shadow-sm rounded border bg-white">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '8%' }}>회원 번호</th>
                  <th style={{ width: '15%' }}>계정 ID</th>
                  <th style={{ width: '15%' }}>닉네임</th>
                  <th style={{ width: '22%' }}>이메일 주소</th>
                  <th style={{ width: '10%' }}>경고 횟수</th>
                  <th style={{ width: '12%' }}>상태 권한</th>
                  <th style={{ width: '18%' }} className="text-center">모니터링</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">유저 목록 로딩 중...</td>
                  </tr>
                ) : pageData.content.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-person-x fs-1 d-block mb-2 text-secondary"></i>
                      <span>조건에 매칭되는 유저 내역이 없습니다.</span>
                    </td>
                  </tr>
                ) : (
                  pageData.content.map((user) => (
                    <tr key={user.id}>
                      <td className="text-secondary fw-bold">{user.id}</td>
                      <td>
                        <Link 
                          to={`/service/admin/users/detail/${user.id}`}
                          className="text-decoration-none fw-bold text-dark"
                        >
                          {user.username}
                        </Link>
                      </td>
                      <td className="fw-semibold">{user.nickname}</td>
                      <td className="text-muted font-monospace">{user.email}</td>
                      <td>
                        <span className={`badge rounded-pill border px-3 py-1 fw-bold ${user.warningCount >= 3 ? 'bg-danger text-white border-danger' : 'border-danger text-danger'}`}>
                          {user.warningCount}회
                        </span>
                      </td>
                      <td>
                        {user.deleted ? (
                          <span className="badge bg-dark p-2">🗑️ 소프트삭제</span>
                        ) : (
                          <>
                            {user.role === 'Black' && <span className="badge bg-danger p-2">🚫 블랙 회원</span>}
                            {user.role === 'NORMAL' && <span className="badge bg-success p-2">✅ 일반 회원</span>}
                            {user.role === 'ADMIN' && <span className="badge bg-primary p-2">👑 관리자</span>}
                          </>
                        )}
                      </td>
                      <td className="text-center">
                        <Link to={`/service/admin/users/detail/${user.id}`} className="btn btn-sm btn-outline-dark fw-bold px-3">
                          <i className="bi bi-search"></i> 상세 검토 ➔
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 영역 */}
          {pageData.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <nav aria-label="Page navigation">
                <ul className="pagination">
                  {/* 이전 페이지 버튼 */}
                  <li className={`page-item ${pageData.first ? 'disabled' : ''}`}>
                    <button 
                      type="button" 
                      className="page-link" 
                      onClick={() => handlePageChange(pageData.number - 1)}
                      disabled={pageData.first}
                    >
                      &laquo;
                    </button>
                  </li>

                  {/* 페이지 번호 루프 (현재 페이지 기준 ±2 범위 노출) */}
                  {Array.from({ length: pageData.totalPages }, (_, index) => index)
                    .filter((pageIdx) => pageIdx >= pageData.number - 2 && pageIdx <= pageData.number + 2)
                    .map((pageIdx) => (
                      <li key={pageIdx} className={`page-item ${pageIdx === pageData.number ? 'active' : ''}`}>
                        <button 
                          type="button" 
                          className="page-link" 
                          onClick={() => handlePageChange(pageIdx)}
                        >
                          {pageIdx + 1}
                        </button>
                      </li>
                    ))}

                  {/* 다음 페이지 버튼 */}
                  <li className={`page-item ${pageData.last ? 'disabled' : ''}`}>
                    <button 
                      type="button" 
                      className="page-link" 
                      onClick={() => handlePageChange(pageData.number + 1)}
                      disabled={pageData.last}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}