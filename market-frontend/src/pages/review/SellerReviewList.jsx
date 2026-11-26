import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Api from '../../api/api';
import ReviewReplies from '../../components/review/ReviewReplies';

export default function SellerReviewList() {
  const { sellerId } = useParams(); // URL 경로에서 sellerId 추출
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0', 10);
   
  const [targetUser, setTargetUser] = useState(null);
  const [reviewData, setReviewData] = useState({ content: [], totalElements: 0, totalPages: 1, first: true, last: true, number: 0 });

  useEffect(() => {
    fetchSellerReviews();
  }, [sellerId, page]);

  const fetchSellerReviews = async () => {
    try {
      // 서버 컨트롤러에서 targetUser와 reviews(Page)를 Map으로 묶어 내려준다고 가정
      const res = await Api.postRequest(`/api/view/reviews/seller/${sellerId}?page=${page}`, null, 'GET');
      setTargetUser(res.data.targetUser);
      setReviewData(res.data.reviews);
    } catch (err) {
      console.error("판매자 후기 조회 실패", err);
    }
  };

  if (!targetUser) return <div className="text-center my-5">로딩 중...</div>;

  return (
    <div className="container my-5" style={{ maxWidth: '700px' }}>

      {/* 판매자 프로필 헤더 */}
      <div className="d-flex align-items-center bg-light p-4 rounded mb-4 shadow-sm">
        <img
          src={targetUser.profileUrl || '/images/default-profile.png'}
          className="rounded-circle border"
          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
          alt="프로필"
        />
        <div className="ms-3">
          <h5 className="fw-bold mb-1">{targetUser.nickname}님의 상점 후기</h5>
          <small className="text-muted">받은 후기 총 {reviewData.totalElements}개</small>
        </div>
      </div>

      {/* 리뷰 리스트 */}
      {reviewData.content && reviewData.content.length > 0 ? (
        <div className="list-group gap-3">
          {reviewData.content.map((review) => (
            <div key={review.id} className="list-group-item rounded border shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <span className="text-warning fw-bold">{'⭐'.repeat(review.rating)}</span>
                  <small className="text-muted ms-2">{review.writerNickname}</small>
                </div>
                <small className="text-muted">{review.createdAt?.substring(0, 10)}</small>
              </div>
              <p className="mb-1 text-secondary" style={{ whiteSpace: 'pre-wrap' }}>{review.content}</p>

              <span className="badge bg-light text-dark text-decoration-none border mt-2">
                <i className="bi bi-box-seam me-1"></i>거래 상품: {review.itemTitle}
              </span>
              <ReviewReplies
                  reviewId={review.id}
                  allowRoot={false}
                />
            </div>
            
          ))}
        </div>
      ) : (
        <div className="py-5 text-center text-muted card border shadow-sm">
          <i className="bi bi-chat-square-heart fs-1 mb-2 text-secondary"></i>
          <span>아직 작성된 거래 후기가 없습니다.</span>
        </div>
      )}

      {/* 페이징 처리 영역 */}
      {reviewData.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav aria-label="Page navigation">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${reviewData.first ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setSearchParams({ page: reviewData.number - 1 })}>이전</button>
              </li>
              {[...Array(reviewData.totalPages)].map((_, idx) => (
                <li key={idx} className={`page-item ${idx === reviewData.number ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setSearchParams({ page: idx })}>{idx + 1}</button>
                </li>
              ))}
              <li className={`page-item ${reviewData.last ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setSearchParams({ page: reviewData.number + 1 })}>다음</button>
              </li>
            </ul>
          </nav>
        </div>
      )}

    </div>
  );
}