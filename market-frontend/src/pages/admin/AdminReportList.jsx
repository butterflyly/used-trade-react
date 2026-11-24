import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Api from '../../api/api';
import dayjs from 'dayjs';

export default function AdminReportList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 쿼리 파라미터에서 현재 status와 page 추출 (기본값 status='PENDING', page=0)
  const currentStatus = searchParams.get('status') || 'PENDING';
  const page = parseInt(searchParams.get('page') || '0', 10);

  // 서버에서 받아올 페이징 및 신고 데이터 상태
  const [pageData, setPageData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    first: true,
    last: true
  });

  const [loading, setLoading] = useState(true);

  // status 혹은 page가 바뀔 때마다 백엔드 신고 목록 API 호출
  useEffect(() => {
    fetchReports();
  }, [currentStatus, page]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await Api.formRequest(`/api/view/admin/reports?status=${currentStatus}&page=${page}`, null, 'GET');
      if (res && res.isAvailable) {
        setPageData(res.data);
      }
    } catch (error) {
      console.error("신고 목록 데이터를 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 핸들러 (탭 누를 시 항상 0페이지부터 시작)
  const handleTabChange = (status) => {
    setSearchParams({ status: status, page: 0 });
  };

  // 페이징 번호 클릭 핸들러
  const handlePageChange = (targetPage) => {
    setSearchParams({ status: currentStatus, page: targetPage });
  };

  // 신고 종류(reportType)에 따른 부트스트랩 배지 클래스 매핑 함수
  const getBadgeClass = (reportType) => {
    switch (reportType) {
      case 'SCAM': return 'bg-danger';
      case 'SPAM': return 'bg-warning text-dark';
      case 'PROHIBITED_ITEM': return 'bg-dark';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container my-5">
      <div className="row g-4">
        {/* 좌측 관리자 사이드바 */}
        <div className="col-md-3">
          <AdminSidebar />
        </div>

        {/* 우측 메인 콘텐츠 영역 */}
        <div className="col-md-9">
          {/* 상단 타이틀 */}
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
            <div>
              <h1 className="h3 mb-1 text-dark fw-bold">
                <i className="bi bi-shield-fill-exclamation text-danger"></i> 신고 접수 및 처리 센터
              </h1>
              <small className="text-muted">유저들이 건전한 플랫폼 조성을 위해 접수한 신고 내역을 검토하고 제재하는 구역입니다.</small>
            </div>
          </div>

          {/* 상단 상태 탭 메뉴 */}
          <div className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                type="button"
                className={`nav-link fw-bold px-4 border-0 bg-transparent ${currentStatus === 'PENDING' ? 'active text-danger border-bottom border-danger border-3' : 'text-secondary'}`}
                onClick={() => handleTabChange('PENDING')}
              >
                ⏳ 처리 대기 목록 {currentStatus === 'PENDING' && <span className="badge bg-danger ms-1">{pageData.totalElements}</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                type="button"
                className={`nav-link fw-bold px-4 border-0 bg-transparent ${currentStatus === 'PROCESSED' ? 'active text-success border-bottom border-success border-3' : 'text-secondary'}`}
                onClick={() => handleTabChange('PROCESSED')}
              >
                ✅ 처리 완료 아카이브
              </button>
            </li>
          </div>

          {/* 신고 목록 테이블 */}
          <div className="table-responsive shadow-sm rounded border bg-white">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '7%' }}>신고 번호</th>
                  <th style={{ width: '13%' }}>신고 종류</th>
                  <th style={{ width: '30%' }}>신고 대상 게시글</th>
                  <th style={{ width: '15%' }}>피신고자(판매자)</th>
                  <th style={{ width: '15%' }}>신고자</th>
                  <th style={{ width: '12%' }}>접수 일시</th>
                  <th style={{ width: '8%' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">신고 목록 로딩 중...</td>
                  </tr>
                ) : pageData.content.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-check-circle fs-1 d-block mb-2 text-success"></i>
                      <span>깨끗합니다! 현재 검토할 신고 내역이 없습니다.</span>
                    </td>
                  </tr>
                ) : (
                  pageData.content.map((report) => (
                    <tr key={report.id}>
                      <td className="text-secondary fw-bold">{report.id}</td>
                      <td>
                        <span className={`badge p-2 w-100 ${getBadgeClass(report.reportType)}`}>
                          {report.reportTypeDescription}
                        </span>
                      </td>
                      <td>
                        <Link 
                          to={`/service/admin/reports/detail/${report.id}`}
                          className="text-decoration-none fw-semibold text-dark text-truncate d-block"
                          style={{ maxWidth: '350px' }}
                        >
                          {report.targetItemTitle}
                        </Link>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-dark">{report.sellerNickname}</span>
                          <small className="text-muted font-monospace">({report.sellerUsername})</small>
                        </div>
                      </td>
                      <td>
                        <span className="text-secondary fw-medium">{report.reporterNickname}</span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {report.createdAt ? dayjs(report.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${report.status === 'PENDING' ? 'border border-danger text-danger' : 'bg-success'}`}>
                          {report.status === 'PENDING' ? '대기중' : '완료'}
                        </span>
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