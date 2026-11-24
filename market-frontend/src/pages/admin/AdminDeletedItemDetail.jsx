import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Api from '../../api/api';

export default function AdminDeletedItemDetail() {
  const { itemId } = useParams(); 
  const navigate = useNavigate();
  const [preserveLoading, setPreserveLoading] = useState(false);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // 상세 아카이브 데이터 로드
  useEffect(() => {
    fetchDeletedItemDetail();
  }, [itemId]);

  const fetchDeletedItemDetail = async () => {
    try {
      const res = await Api.formRequest(`/api/view/admin/items/deleted-detail/${itemId}`, null, 'GET');
      if (res && res.isAvailable) {
        setItem(res.data);
      } else {
        alert("해당 삭제글 아카이브를 찾을 수 없습니다.");
        navigate('/service/admin/items/deleted-list');
      }
    } catch (error) {
      console.error("삭제글 상세 데이터를 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreserve = async () => {
  if (preserveLoading) return;

  const confirmMessage = item.isPermanentPreserved
    ? "영구 보존 설정을 해제하시겠습니까?"
    : "이 게시글을 영구 보존하시겠습니까?";

  if (!window.confirm(confirmMessage)) return;

  setPreserveLoading(true);

  try {
      const res = await Api.formRequest(
        `/api/admin/items/toggle-preserve/${item.id}`,
        null,
        'POST'
      );

      if (res && res.isAvailable) {
        setItem(prev => ({
          ...prev,
          isPermanentPreserved: !prev.isPermanentPreserved
        }));

        alert(res.message);
      } else {
        alert(res?.message || "보존 설정 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 보존 설정 변경 실패:", error);
      alert("보존 설정 변경 중 오류가 발생했습니다.");
    } finally {
      setPreserveLoading(false);
    }
  };

  // 서류 인쇄 함수
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center my-5">포렌식 아카이브 데이터 로딩 중...</div>;
  }

  if (!item) return null;

  return (
    <div className="container my-5">
      <div className="row g-4">
        {/* 좌측 관리자 사이드바 */}
        <div className="col-md-3">
          <AdminSidebar />
        </div>

        {/* 우측 메인 포렌식 콘텐츠 */}
        <div className="col-md-9">
          <div className="card border-danger mb-5 shadow">
            
            {/* 상단 포렌식 배너 헤더 */}
            <div className="card-header bg-danger text-white fw-bold d-flex justify-content-between align-items-center py-3">
              <span>
                <i className="bi bi-shield-lock-fill me-2"></i> 
                [포렌식 데이터] 본 내역은 유저가 삭제하여 숨김 처리된 백업 데이터입니다.
              </span>
              <button className="btn btn-sm btn-light fw-bold" onClick={handlePrint}>
                <i className="bi bi-printer"></i> 서류 인쇄
              </button>
            </div>

            {/* 메타데이터 요약 박스 */}
            <div className="card-body bg-light row g-3">
              <div className="col-md-4 border-end">
                <small className="text-muted d-block">데이터 관리 코드</small>
                <span className="fw-bold fs-5 text-dark">ARTICLE-NO-{item.id}</span>
              </div>
              <div className="col-md-4 border-end">
                <small className="text-muted d-block">피의자(작성자) 고유 ID</small>
                <span className="fw-bold fs-5 text-primary">{item.sellerUsername}</span>
              </div>
              <div className="col-md-4">
                <small className="text-muted d-block">최종 파기 대기일 (updatedAt)</small>
                <span className="fw-bold fs-5 text-danger">{item.finaldestructionDate}</span>
              </div>
            </div>
          </div>

          <div className="card mb-4 border-warning shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">

              <div>
                <h6 className="fw-bold mb-2">
                  <i className="bi bi-shield-check me-2"></i>
                  영구 삭제 방지 설정
                </h6>

                {item.isPermanentPreserved ? (
                  <span className="badge bg-success">
                    영구 보존 설정됨
                  </span>
                ) : (
                  <span className="badge bg-secondary">
                    영구 삭제 대기 상태
                  </span>
                )}

                <small className="text-muted d-block mt-2">
                  {item.isPermanentPreserved
                    ? "자동 영구 삭제 대상에서 제외됩니다."
                    : "설정된 보존 기간이 지나면 자동 영구 삭제될 수 있습니다."}
                </small>
              </div>

              <button
                type="button"
                className={`btn ${
                  item.isPermanentPreserved
                    ? 'btn-outline-danger'
                    : 'btn-outline-success'
                }`}
                onClick={handleTogglePreserve}
                disabled={preserveLoading}
              >
                {preserveLoading
                  ? "처리 중..."
                  : item.isPermanentPreserved
                    ? "보존 해제"
                    : "영구 보존 설정"}
              </button>

            </div>
          </div>

          <div className="row g-4">
            {/* 좌측: 이미지 슬라이드 (캐러셀) 영역 */}
            <div className="col-md-6">
              {!item.itemImageList || item.itemImageList.length === 0 ? (
                <div className="item-image-placeholder mb-3 d-flex align-items-center justify-content-center border rounded bg-light" style={{ height: '400px' }}>
                  <div className="text-muted text-center">
                    <i className="bi bi-image fs-1 d-block mb-2"></i>
                    <span>등록된 상품 이미지가 없습니다.</span>
                  </div>
                </div>
              ) : (
                <div id="itemImageCarousel" className="carousel slide mb-3 border rounded shadow-sm overflow-hidden" data-bs-ride="carousel">
                  {item.itemImageList.length > 1 && (
                    <div className="carousel-indicators">
                      {item.itemImageList.map((img, statIndex) => (
                        <button
                          key={statIndex}
                          type="button"
                          data-bs-target="#itemImageCarousel"
                          data-bs-slide-to={statIndex}
                          className={statIndex === 0 ? 'active' : ''}
                          aria-current={statIndex === 0 ? 'true' : 'false'}
                        ></button>
                      ))}
                    </div>
                  )}
                  <div className="carousel-inner" style={{ height: '400px', backgroundColor: '#000' }}>
                    {item.itemImageList.map((img, statIndex) => (
                      <div key={statIndex} className={`carousel-item h-100 ${statIndex === 0 ? 'active' : ''}`}>
                        <img 
                          src={img.url} 
                          className="d-block w-100 h-100" 
                          style={{ objectFit: 'contain', backgroundColor: '#f8f9fa' }} 
                          alt="상품상세이미지" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 우측: 상품 상세 정보 및 작성자 포렌식 정보 */}
            <div className="col-md-6">
              <div className="item-info-header">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <span className="badge bg-dark">{item.categoryName}</span>
                    <small className="text-muted ms-2">최초 등록일: {item.createdAt}</small>
                  </div>
                  <div className="text-muted small">
                    <i className="bi bi-eye"></i> 누적 조회수: <span>{item.views}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="badge bg-danger p-2 fs-6">유저 삭제 완료(소프트 삭제)</span>
                  <span className="badge bg-secondary p-2 fs-6 ms-1">최종 거래상태: {item.itemStatus}</span>
                </div>

                <h1 className="display-6 fw-bold text-decoration-line-through text-muted">{item.title}</h1>
                <h2 className="text-danger fw-bold mt-3">
                  {Number(item.price).toLocaleString()}원
                </h2>
              </div>

              {/* 작성자 정보 카드 */}
              <div className="d-flex align-items-center justify-content-between mb-4 p-3 border rounded shadow-sm bg-white">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <img 
                      src={item.sellerProfileUrl ? item.sellerProfileUrl : '/images/default-profile.png'} 
                      className="rounded-circle border" 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                      alt="작성자" 
                    />
                  </div>
                  <div className="ms-3">
                    <h5 className="mb-0 fw-bold text-dark">
                      <span>{item.sellerDisplayName}</span>
                      <small className="text-muted font-monospace">({item.sellerUsername})</small>
                    </h5>
                    <small className="text-muted d-block">작성자 고유 시퀀스 고유값: No.{item.sellerId}</small>
                  </div>
                </div>
              </div>

              {/* 등록 본문 사본 */}
              <div className="item-content mb-5 p-3 border rounded bg-white" style={{ minHeight: '200px', whiteSpace: 'pre-wrap', fontSize: '1.1rem' }}>
                <p className="fw-bold text-secondary border-bottom pb-2"><i className="bi bi-body-text"></i> 등록 본문 사본</p>
                <span>{item.content}</span>
              </div>

              {/* 하단 네비게이션 */}
              <div className="d-flex gap-2 align-items-center border-top pt-3">
                <Link to="/service/admin/items/deleted-list" className="btn btn-dark px-4">
                  <i className="bi bi-arrow-left"></i> 아카이브 목록으로
                </Link>
                <small className="text-muted ms-auto"><i className="bi bi-info-circle"></i> 본 화면은 외부로 노출되지 않는 최고 권한 관리자 전용 뷰입니다.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}