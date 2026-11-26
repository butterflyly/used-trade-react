import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Api from '../../api/api';
import ReviewReplies from '../../components/review/ReviewReplies';

export default function MyReviews() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || 'written'; // 'written' 또는 'received'
  const page = parseInt(searchParams.get('page') || '0', 10);

  const [reviewData, setReviewData] = useState({ content: [], totalElements: 0, totalPages: 1 });
  const [reviewCounts, setReviewCounts] = useState({
    written: 0,
    received: 0
  });

  // 수정 모달 관련 상태
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState('');

  // 리뷰 목록 데이터 페치
  useEffect(() => {
  fetchReviews(type, page);
  fetchReviewCounts();
  }, [type, page]);

 const fetchReviews = async (currentType, currentPage) => {
    try {
     const res = await Api.postRequest(
        `/api/view/reviews/my?type=${currentType}&page=${currentPage}`,
        null,
        'GET'
      );
      
      // 서버가 Page 객체 자체를 주므로 res를 바로 세팅합니다.
      setReviewData(res.data); 
    } catch (err) {
      console.error("리뷰 조회 실패", err);
    }
  };

  const fetchReviewCounts = async () => {
    try {
      const res = await Api.postRequest(
        '/api/view/reviews/my/counts',
        null,
        'GET'
      );

      if (res && res.isAvailable) {
        setReviewCounts(res.data);
      }
    } catch (err) {
      console.error("리뷰 개수 조회 실패", err);
    }
  };

  // 1. 리뷰 삭제 핸들러 (DELETE /api/reviews/{id})
  const handleDelete = async (reviewId) => {
    if (!window.confirm("정말 이 후기를 삭제하시겠습니까?")) return;

    try {
      await Api.postRequest(`/api/reviews/${reviewId}`, null, "DELETE");
      // 프론트엔드 상태에서 즉시 제거
      setReviewData(prev => ({
        ...prev,
        content: prev.content.filter(item => item.id !== reviewId),
        totalElements: prev.totalElements - 1
      }));
      alert("후기가 삭제되었습니다.");
    } catch (err) {
      alert(err.message || "리뷰 삭제에 실패했습니다.");
    }
  };

  // 2. 수정 모달 열기
  const openEditModal = (review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditContent(review.content);
    setShowModal(true);
  };

  // 3. 수정 완료 핸들러 (PATCH /api/reviews/{id})
  const handleUpdateSubmit = async () => {
    if (!editContent.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      await Api.postRequest(`/api/reviews/${editingReview.id}`, {
        rating: parseInt(editRating),
        content: editContent
      }, "PATCH");

      setShowModal(false);
      fetchReviews(type, page); // 목록 갱신
      alert("후기가 수정되었습니다.");
    } catch (err) {
      alert(err.message || "리뷰 수정에 실패했습니다.");
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '750px' }}>
      <h4 className="fw-bold mb-4"><i className="bi bi-journal-check me-2"></i>내 거래 후기 관리</h4>

      {/* 탭 메뉴 */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${type === 'written' ? 'active' : ''}`}
                  onClick={() => setSearchParams({ type: 'written', page: 0 })}>
            내가 작성한 후기 <span className="badge bg-primary rounded-pill ms-1">{reviewCounts.written}</span>
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fw-semibold ${type === 'received' ? 'active' : ''}`}
                  onClick={() => setSearchParams({ type: 'received', page: 0 })}>
            내가 받은 후기 <span className="badge bg-success rounded-pill ms-1">{reviewCounts.received}</span>
          </button>
        </li>
      </ul>

      {/* 리뷰 리스트 */}
      {reviewData.content && reviewData.content.length > 0 ? (
        <div className="list-group gap-3">
          {reviewData.content.map((review) => (
            <div key={review.id} className="list-group-item rounded border shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <span className="text-warning fw-bold">{'⭐'.repeat(review.rating)}</span>
                  <small className="text-muted ms-2">
                    {type === 'written' ? `상대방: ${review.receviedNickname}` : `작성자: ${review.writerNickname}`}
                  </small>
                </div>
                <small className="text-muted">{review.createdAt?.substring(0, 10)}</small>
              </div>

              <p className="mb-2 text-secondary" style={{ whiteSpace: 'pre-wrap' }}>{review.content}</p>

              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                <span className="badge bg-light text-dark text-decoration-none border">
                  <i className="bi bi-box-seam me-1"></i>거래 상품명: {review.itemTitle}
                </span>

                {type === 'written' && (
                  <div className="btn-group btn-group-sm">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => openEditModal(review)}>
                      <i className="bi bi-pencil-square"></i> 수정
                    </button>
                    <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(review.id)}>
                      <i className="bi bi-trash"></i> 삭제
                    </button>
                  </div>
                )}
              </div>
               <ReviewReplies
                  reviewId={review.id}
                  allowRoot={type === 'written'}
                />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-5 text-center text-muted card border shadow-sm">
          <i className="bi bi-inbox fs-1 mb-2 text-secondary"></i>
          <span>{type === 'written' ? '아직 작성한 거래 후기가 없습니다.' : '아직 받은 거래 후기가 없습니다.'}</span>
        </div>
      )}

      {/* 여기에 모달 컴포넌트 및 페이징 UI 부착 */}
      {/* 리뷰 수정 모달 */}
      {showModal && editingReview && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title fw-bold">거래 후기 수정</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">별점</label>
                  <select
                    className="form-select"
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {'⭐'.repeat(rating)} ({rating}점)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">후기 내용</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="거래 후기를 입력해주세요."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  취소
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateSubmit}
                >
                  수정 완료
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}