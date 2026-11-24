
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useItemDetail } from './useItemDetail';
import './detail.css';

function ItemDetail() {
  const {
    id,
    item,
    loading,
    user,
    isAuthenticated,
    selectedStatus,
    chatBuyers,
    showBuyerModal,
    pendingStatus,
    reportType,
    reportContent,
    setReportType,
    setReportContent,
    handleDelete,
    handleCreateChat,
    handleToggleLike,
    handleStatusChange,
    handleCloseBuyerModal,
    handleSelectBuyer,
    handleReportSubmit,
    handleWarnSeller,
    handleBlackSeller
  } = useItemDetail();

  const reportModalCloseRef = useRef(null);

  if (loading) {
    return <div className="text-center my-5">로딩 중...</div>;
  }

  if (!item) {
    return <div className="text-center my-5">상품을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container my-5">
      <input type="hidden" id="id" value={id} />

      <div className="row g-5">

        {/* 이미지 영역 */}
        <div className="col-md-6">
          {(!item.itemImageList || item.itemImageList.length === 0) ? (
            <div
              className="item-image-placeholder mb-3 d-flex align-items-center justify-content-center border rounded bg-light"
              style={{ height: '400px' }}
            >
              <div className="text-muted text-center">
                <i className="bi bi-image fs-1 d-block mb-2"></i>
                <span>등록된 상품 이미지가 없습니다.</span>
              </div>
            </div>
          ) : (
            <div
              id="itemImageCarousel"
              className="carousel slide mb-3 border rounded shadow-sm overflow-hidden"
              data-bs-ride="carousel"
            >
              {item.itemImageList.length > 1 && (
                <div className="carousel-indicators">
                  {item.itemImageList.map((img, stat) => (
                    <button
                      key={stat}
                      type="button"
                      data-bs-target="#itemImageCarousel"
                      data-bs-slide-to={stat}
                      className={stat === 0 ? 'active' : ''}
                      aria-current={stat === 0 ? 'true' : 'false'}
                    />
                  ))}
                </div>
              )}

              <div
                className="carousel-inner"
                style={{ height: '400px', backgroundColor: '#000' }}
              >
                {item.itemImageList.map((img, stat) => (
                  <div
                    key={stat}
                    className={`carousel-item h-100 ${stat === 0 ? 'active' : ''}`}
                  >
                    <img
                      src={img.url}
                      className="d-block w-100 h-100"
                      style={{
                        objectFit: 'contain',
                        backgroundColor: '#f8f9fa'
                      }}
                      alt="상품상세이미지"
                    />
                  </div>
                ))}
              </div>

              {item.itemImageList.length > 1 && (
                <>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#itemImageCarousel"
                    data-bs-slide="prev"
                  >
                    <span
                      className="carousel-control-prev-icon bg-dark rounded-circle"
                      aria-hidden="true"
                    />
                    <span className="visually-hidden">Previous</span>
                  </button>

                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#itemImageCarousel"
                    data-bs-slide="next"
                  >
                    <span
                      className="carousel-control-next-icon bg-dark rounded-circle"
                      aria-hidden="true"
                    />
                    <span className="visually-hidden">Next</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 상세 정보 영역 */}
        <div className="col-md-6">
          <div className="item-info-header">

            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <span className="badge bg-primary">
                  {item.categoryName}
                </span>

                <small className="text-muted ms-2">
                  {item.createdAt}
                </small>

                {item.createdAt !== item.updatedAt &&
                  item.updatedAt !== '-' && (
                    <small className="text-muted">(수정됨)</small>
                  )}
              </div>

              <div className="text-muted small">
                <i className="bi bi-eye"></i>
                <span>{item.views}</span>
              </div>
            </div>

            {/* 판매 상태 */}
            <div className="mb-3" style={{ maxWidth: '150px' }}>
              {item.isOwner ? (
                <select
                  id="statusSelect"
                  className={`form-select form-select-sm fw-bold border-2 ${
                    selectedStatus === 'ON_SALE'
                      ? 'border-primary text-primary'
                      : selectedStatus === 'RESERVED'
                        ? 'border-warning text-warning'
                        : 'border-secondary text-secondary'
                  }`}
                  value={selectedStatus}
                  onChange={handleStatusChange}
                >
                  <option value="ON_SALE">판매중</option>
                  <option value="RESERVED">예약중</option>
                  <option value="SOLD_OUT">판매완료</option>
                </select>
              ) : (
                <span
                  className={`badge p-2 fs-6 ${
                    selectedStatus === 'ON_SALE'
                      ? 'bg-primary'
                      : selectedStatus === 'RESERVED'
                        ? 'bg-warning text-dark'
                        : 'bg-secondary'
                  }`}
                >
                  {selectedStatus === 'ON_SALE'
                    ? '판매중'
                    : selectedStatus === 'RESERVED'
                      ? '예약중'
                      : '판매완료'}
                </span>
              )}
            </div>

            <h1 className="display-6 fw-bold">{item.title}</h1>

            <h2 className="text-danger fw-bold mt-3">
              {Number(item.price).toLocaleString()}원
            </h2>
          </div>

          {/* 판매자 정보 카드 */}
          <div className="d-flex align-items-center justify-content-between mb-4 p-3 border rounded shadow-sm">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <img
                  src={
                    item.sellerProfileUrl
                      ? item.sellerProfileUrl
                      : '/images/default-profile.png'
                  }
                  className="rounded-circle border"
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover'
                  }}
                  alt="판매자"
                />
              </div>

              <div className="ms-3 dropdown">
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-link p-0 text-dark text-decoration-none fw-bold dropdown-toggle"
                    id="sellerMenuButton"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {item.sellerDisplayName}
                  </button>

                  <span className="badge bg-light text-dark border align-middle fw-semibold">
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    <span>{Number(item.sellerRating).toFixed(1)}</span>
                  </span>

                  <ul
                    className="dropdown-menu shadow border-0 mt-2"
                    aria-labelledby="sellerMenuButton"
                  >
                    <li>
                      <Link
                        className="dropdown-item py-2 fw-medium"
                        to={`/service/items/list?searchType=seller&keyword=${encodeURIComponent(item.sellerDisplayName)}`}
                      >
                        <i className="bi bi-box-seam me-2 text-primary"></i>
                        판매자 상품 목록 보기
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider my-1" />
                    </li>

                    <li>
                      <Link
                        className="dropdown-item py-2 fw-medium"
                        to={`/service/reviews/seller/${item.sellerId}`}
                      >
                        <i className="bi bi-chat-square-heart me-2 text-success"></i>
                        판매자 거래 후기 보기
                      </Link>
                    </li>
                  </ul>
                </div>

                <small
                  className="text-muted d-block"
                  style={{ marginTop: '2px' }}
                >
                  인증된 판매자 (클릭 시 메뉴 열림)
                </small>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                id="likeBtn"
                onClick={handleToggleLike}
                className={`btn d-flex align-items-center gap-1 fw-bold px-3 ${
                  item.isLiked
                    ? 'btn-danger text-white'
                    : 'btn-outline-danger'
                }`}
                disabled={item.isOwner}
                title={
                  item.isOwner
                    ? '본인 상품은 찜할 수 없습니다.'
                    : '관심상품 등록'
                }
              >
                <i
                  className={`bi ${
                    item.isLiked ? 'bi-heart-fill' : 'bi-heart'
                  }`}
                />
                <span>{item.likeCount}</span>
              </button>

              <button
                id="chat_create"
                onClick={handleCreateChat}
                className="btn btn-success px-4 fw-bold"
              >
                채팅하기
              </button>
            </div>
          </div>

          {/* 상품 내용 */}
          <div
            className="item-content mb-5"
            style={{
              minHeight: '200px',
              whiteSpace: 'pre-wrap',
              fontSize: '1.1rem'
            }}
          >
            <p>{item.content}</p>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <Link
              to={`/service/items/list/${item.categoryId}`}
              className="btn btn-outline-dark px-4"
            >
              목록으로
            </Link>

            {item.isOwner && (
              <Link
                to={`/service/items/edit/${item.id}`}
                className="btn btn-outline-primary px-4"
              >
                수정하기
              </Link>
            )}

            {(item.isOwner || user?.role === 'ADMIN') && (
              <button
                id="deleteBtn"
                onClick={handleDelete}
                className="btn btn-outline-danger px-4"
              >
                삭제하기
              </button>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <button
                  type="button"
                  className="btn btn-warning px-3"
                  onClick={handleWarnSeller}
                >
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  작성자 경고 1회
                </button>

                <button
                  type="button"
                  className="btn btn-dark px-3"
                  onClick={handleBlackSeller}
                >
                  <i className="bi bi-person-fill-slash me-1"></i>
                  작성자 영구 정지
                </button>
              </>
            )}

            {!item.isOwner && (
              <button
                type="button"
                className="btn btn-outline-secondary px-3 ms-auto"
                data-bs-toggle="modal"
                data-bs-target="#reportModal"
              >
                <i className="bi bi-flag-fill text-danger me-1"></i>
                신고하기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 구매자 선택 모달 */}
      {showBuyerModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="buyerModalLabel"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">

                <div className="modal-header">
                  <h5
                    className="modal-title fw-bold"
                    id="buyerModalLabel"
                  >
                    {pendingStatus === 'RESERVED'
                      ? '예약할 구매자 선택'
                      : '거래 완료할 구매자 선택'}
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseBuyerModal}
                    aria-label="닫기"
                  />
                </div>

                <div className="modal-body">
                  <p className="text-muted small mb-3">
                    이 상품과 대화한 구매자가 여러 명입니다.
                    상태를 변경할 구매자를 선택해 주세요.
                  </p>

                  <div className="list-group">
                    {chatBuyers.map((buyer) => (
                      <button
                        key={buyer.username}
                        type="button"
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                        onClick={() => handleSelectBuyer(buyer)}
                      >
                        <span>
                          <i className="bi bi-person-circle me-2 text-secondary"></i>
                          <strong>{buyer.displayNickname}</strong>
                        </span>

                        <span className="badge bg-primary rounded-pill">
                          선택
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseBuyerModal}
                  >
                    취소
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* 모달 배경 */}
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseBuyerModal}
          />
        </>
      )}

      {/* 신고 모달 */}
      <div
        className="modal fade"
        id="reportModal"
        tabIndex="-1"
        aria-labelledby="reportModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">

            <div className="modal-header bg-light">
              <h5
                className="modal-title fw-bold text-dark"
                id="reportModalLabel"
              >
                📌 게시글 신고하기
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                ref={reportModalCloseRef}
              />
            </div>

            <form
              onSubmit={(e) =>
                handleReportSubmit(e, () => {
                  const modalEl = document.getElementById('reportModal');
                  const modal = window.bootstrap.Modal.getInstance(modalEl);
                  modal?.hide();
                })
              }
            >
              <div className="modal-body p-4">
                <p className="small text-muted mb-3">
                  해당 게시글이 중고거래 운영 정책에 위배된다면
                  사유를 선택해 주세요.
                </p>

                <div className="mb-3">
                  <label className="form-label fw-bold small text-secondary">
                    신고 종류
                  </label>

                  <select
                    className="form-select"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      --- 사유를 선택하세요 ---
                    </option>
                    <option value="SPAM">
                      광고성 게시글 (홍보, 도배 등)
                    </option>
                    <option value="SCAM">
                      사기 의심 (예약금 먹튀, 위조품 등)
                    </option>
                    <option value="BAD_MANNERS">
                      욕설 및 비매너
                    </option>
                    <option value="PROHIBITED_ITEM">
                      판매 금지 물품 등록
                    </option>
                  </select>
                </div>

                <div className="mb-0">
                  <label className="form-label fw-bold small text-secondary">
                    상세 사유
                  </label>

                  <textarea
                    className="form-control"
                    rows="4"
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    placeholder="구체적인 정황을 적어주세요."
                    required
                  />
                </div>
              </div>

              <div className="modal-footer bg-light border-top-0">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary px-3"
                  data-bs-dismiss="modal"
                >
                  취소
                </button>

                <button
                  type="submit"
                  className="btn btn-sm btn-danger px-3 fw-bold"
                >
                  신고 접수
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ItemDetail;
