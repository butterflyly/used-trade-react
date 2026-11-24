import React, { useState, useEffect , useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Api from '../../api/api';


export default function AdminDeletedItemList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestIdRef = useRef(0);

  // URL 쿼리 파라미터에서 현재 페이지와 검색어 추출 (기본값 page=0, kw='')
  const page = parseInt(searchParams.get('page') || '0', 10);
  const keyword = searchParams.get('kw') || '';

  // 기본값 false = 영구 보존 안 함
  const preserved = searchParams.get('preserved') === 'true';

  // 로컬 검색 입력창 상태 (사용자가 타이핑하는 동안 유지)
  const [searchInput, setSearchInput] = useState(keyword);
  
  // 서버에서 받아올 페이징 데이터 상태
  const [pageData, setPageData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    first: true,
    last: true
  }); 
  const [loading, setLoading] = useState(true);

  // page 혹은 keyword가 바뀔 때마다 백엔드 아카이브 목록 API 호출
  useEffect(() => {
    fetchDeletedItems();
    setSearchInput(keyword); // URL이 외부에서 변경될 때 인풋창 동기화
  }, [page, keyword, preserved]);

  const fetchDeletedItems = async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await Api.formRequest(
        `/api/view/admin/items/deleted-list?page=${page}&kw=${encodeURIComponent(keyword)}&preserved=${preserved}`,
        null,
        'GET'
      );

      // 최신 요청이 아닌 이전 요청의 응답은 무시
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (res && res.isAvailable) {
          setPageData(res.data);
      }
    } catch (error) {
       if (currentRequestId === requestIdRef.current) {
          console.error("삭제 게시글 목록을 불러오지 못했습니다.", error);
        }
    } finally {
       if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // 검색 폼 제출 핸들러
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    setSearchParams({
      page: 0,
      kw: searchInput,
      preserved: String(preserved)
    });
};

  // 페이지네이션 클릭 핸들러
  const handlePageChange = (targetPage) => {
      setSearchParams({
        page: targetPage,
        kw: keyword,
        preserved: String(preserved)
      });
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
          {/* 상단 타이틀 & 총 개수 배지 */}
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
            <div>
              <h1 className="h3 mb-1 text-danger fw-bold">🛑 소프트 삭제 게시글 아카이브</h1>
           <small className="text-muted">
                {preserved
                  ? "관리자가 영구 보존 설정한 삭제 게시글입니다."
                  : "영구 보존 설정이 없는 삭제 게시글입니다. 보존 기간 경과 시 완전 삭제 대상이 됩니다."}
              </small>
            </div>
            <span className="badge bg-danger p-2 fs-6">총 {pageData.totalElements}건 보존 중</span>
          </div>

            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${!preserved ? 'active' : ''}`}
                  onClick={() => setSearchParams({
                    page: 0,
                    kw: keyword,
                    preserved: 'false'
                  })}
                >
                  <i className="bi bi-trash me-2"></i>
                  삭제 대기 게시글
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${preserved ? 'active' : ''}`}
                  onClick={() => setSearchParams({
                    page: 0,
                    kw: keyword,
                    preserved: 'true'
                  })}
                >
                  <i className="bi bi-shield-check me-2"></i>
                  영구 보존 게시글
                </button>
              </li>
            </ul>

          {/* 통합 추적 검색 바 */}
          <div className="search-wrapper mb-4 p-3 bg-light rounded border shadow-sm">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span className="input-group-text bg-white border-secondary-subtle">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  name="kw" 
                  className="form-control border-secondary-subtle"
                  placeholder="게시글 제목, 내용, 작성자 고유 ID(username), 닉네임을 입력하세요..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button className="btn btn-danger px-4 fw-bold" type="submit">통합 추적</button>
                {keyword && (
                  <Link to="/service/admin/items/deleted-list" className="btn btn-outline-secondary px-3">
                    초기화
                  </Link>
                )}
              </div>
            </form>
          </div>

          {/* 아카이브 목록 테이블 */}
          <div className="table-responsive shadow-sm rounded border bg-white">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '8%' }}>글 ID</th>
                  <th style={{ width: '12%' }}>카테고리</th>
                  <th style={{ width: '40%' }}>게시글 제목</th>
                  <th style={{ width: '20%' }}>피의자(작성자) 정보</th>
                  <th style={{ width: '10%' }}>최종 가격</th>
                  <th style={{ width: '10%' }}>삭제(수정)일시</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">데이터 로딩 중...</td>
                  </tr>
                ) : pageData.content.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-folder-x fs-1 d-block mb-2"></i>
                      <span>조건에 매칭되거나 보존 기간 내의 삭제된 게시글이 없습니다.</span>
                    </td>
                  </tr>
                ) : (
                  pageData.content.map((item) => (
                    <tr key={item.id}>
                      <td className="text-secondary fw-bold">{item.id}</td>
                      <td>
                        <span className="badge bg-secondary-subtle text-dark border border-secondary">{item.categoryName}</span>
                      </td>
                      <td>
                        <Link 
                          to={`/service/admin/items/deleted-detail/${item.id}`}
                          className="text-decoration-none fw-semibold text-dark text-truncate d-block"
                          style={{ maxWidth: '450px' }}
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <small className="text-muted">ID: {item.sellerUsername}</small>
                        </div>
                      </td>
                      <td className="fw-bold text-danger">
                        {Number(item.price).toLocaleString()}원
                      </td>
                      <td>
                        <small className="text-muted">{item.updatedAt}</small>
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