import React from 'react';
import { Link } from 'react-router-dom';
import { useMyPage } from './useMyPage';
import './mypage.css';
import '../user-common.css';

function MyPage() {
  const {
    loading,
    myPageData,
    isModalOpen,
    modalItemTitle,
    modalRating,
    setModalRating,
    modalContent,
    setModalContent,
    openReviewModal,
    closeReviewModal,
    handleReviewSubmit,
    handleDeleteReview,
    handleWithdrawClick,
    reloadPage
  } = useMyPage();

  if (loading) return <div className="text-center my-5">로딩 중...</div>;

  const { userInfo, sellingPosts, boughtPosts, likedPosts, buyChatRooms, sellChatRooms, writtenReviews, receivedReviews } = myPageData;
  const isSocial = userInfo.providers != null && userInfo.providers !== '';

  return (
    <div className="container mypage-container my-5">
      {/* 사용자 프로필 요약 카드 */}
      <div className="card shadow-sm p-4 mb-5 bg-white rounded border-0">
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="profile-icon-wrapper">
              <img
                  src={`http://localhost:8080${userInfo.profileUrl || '/images/default-profile.png'}`}
                  alt="프로필"
                  className="rounded-circle border shadow-sm"
                  style={{ width: '65px', height: '65px', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h4 className="fw-bold mb-0">{userInfo.nickname}님의 마이페이지</h4>
              <small className="text-muted">{userInfo.email}</small>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-sm-12">
              <div className="info-item-box d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block">가입일</small>
                  <span className="fw-medium">
                    {userInfo.createdAt ? userInfo.createdAt.substring(0, 10) : '-'}
                  </span>
                </div>
                <span className="badge rounded-pill bg-light text-dark border">정회원</span>
              </div>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <Link to="/service/users/profile/update" className="btn btn-primary btn-sm px-4">정보 수정</Link>

            {!isSocial && (
              <Link to="/service/users/profile/password-update" className="btn btn-outline-secondary btn-sm px-4">비밀번호 변경</Link>
            )}

            {!isSocial ? (
              <Link to="/service/users/profile/withdraw" className="btn btn-link btn-sm text-danger ms-auto text-decoration-none">회원 탈퇴</Link>
            ) : (
              <button 
                type="button" 
                id="withdrawBtn"
                onClick={() => handleWithdrawClick(true)} 
                className="btn btn-link btn-sm text-danger ms-auto text-decoration-none"
              >
                회원 탈퇴
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 영역 */}
      <div className="card shadow-sm border-0 bg-white rounded">
        <div className="card-header bg-white pt-3 px-4 border-bottom-0">
          <ul className="nav nav-pills" id="myTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button className="nav-link active" id="item-tab" data-bs-toggle="tab" data-bs-target="#item-pane" type="button" role="tab">내 판매글</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="buy-item-tab" data-bs-toggle="tab" data-bs-target="#buy-item-pane" type="button" role="tab">내 구매 내역</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="like-tab" data-bs-toggle="tab" data-bs-target="#like-pane" type="button" role="tab">내 찜 목록</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="buy-tab" data-bs-toggle="tab" data-bs-target="#buy-pane" type="button" role="tab">구매 채팅</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="sell-tab" data-bs-toggle="tab" data-bs-target="#sell-pane" type="button" role="tab">판매 채팅</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="written-review-tab" data-bs-toggle="tab" data-bs-target="#written-review-pane" type="button" role="tab">내가 쓴 후기</button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link" id="received-review-tab" data-bs-toggle="tab" data-bs-target="#received-review-pane" type="button" role="tab">내가 받은 후기</button>
            </li>
          </ul>
        </div>

        <div className="card-body p-4 tab-content" id="myTabContent">
          {/* 1. 내 판매글 탭 */}
          <div className="tab-pane fade show active" id="item-pane" role="tabpanel" tabIndex="0">
            {sellingPosts.content && sellingPosts.content.length > 0 ? (
              <>
                <div className="row row-cols-1 row-cols-md-2 g-3">
                  {sellingPosts.content.map(item => (
                    <div className="col" key={item.id}>
                      <Link to={`/service/items/detail/${item.id}`} className="text-decoration-none text-dark">
                        <div className="card h-100 border shadow-sm rounded p-2 flex-row align-items-center">
                          <img src={item.imageUrl} className="rounded" style={{ width: '80px', height: '80px', objectFit: 'cover' }} alt="상품 이미지" />
                          <div className="ms-3 overflow-hidden">
                            <h6 className="card-title text-truncate mb-1 fw-bold">{item.title}</h6>
                            <p className="card-text text-primary fw-bold mb-1">{Number(item.price).toLocaleString()}원</p>
                            <small className="text-muted">{item.createdAt}</small>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <Link to="/service/users/activities/item-list" className="btn btn-outline-secondary btn-sm px-5 rounded-pill">
                    내 판매글 전체보기 <i className="bi bi-chevron-right ms-1"></i>
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-5 text-center text-muted">등록된 상품이 없습니다.</div>
            )}
          </div>

          {/* 2. 내 구매 내역 탭 */}
          <div className="tab-pane fade" id="buy-item-pane" role="tabpanel" tabIndex="0">
            {boughtPosts.content && boughtPosts.content.length > 0 ? (
              <>
                <div className="row row-cols-1 row-cols-md-2 g-3">
                  {boughtPosts.content.map(item => (
                    <div className="col" key={item.id}>
                      <div className="card h-100 border shadow-sm rounded p-2 flex-row align-items-center justify-content-between">
                        <Link to={`/service/items/detail/${item.id}`} className="text-decoration-none text-dark d-flex align-items-center overflow-hidden me-2">
                          <img src={item.imageUrl} className="rounded flex-shrink-0" style={{ width: '80px', height: '80px', objectFit: 'cover' }} alt="상품 이미지" />
                          <div className="ms-3 overflow-hidden">
                            <h6 className="card-title text-truncate mb-1 fw-bold">{item.title}</h6>
                            <p className="card-text text-primary fw-bold mb-1">{Number(item.price).toLocaleString()}원</p>
                            <small className="text-muted">{item.createdAt}</small>
                          </div>
                        </Link>

                        <div className="flex-shrink-0 ms-2">
                          {!item.hasReviewed ? (
                            <button 
                              type="button" 
                              className="btn btn-outline-primary btn-sm rounded-pill px-3 btn-open-review-modal"
                              onClick={() => openReviewModal(item.id, item.title)}
                            >
                              <i className="bi bi-pencil-square me-1"></i>후기 작성
                            </button>
                          ) : (
                            <span className="badge bg-light text-secondary border rounded-pill px-3 py-2">
                              <i className="bi bi-check-circle-fill text-success me-1"></i>작성 완료
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <Link to="/service/users/activities/buy-items" className="btn btn-outline-secondary btn-sm px-5 rounded-pill">
                    구매 내역 전체보기 <i className="bi bi-chevron-right ms-1"></i>
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-5 text-center text-muted">구매한 상품이 없습니다.</div>
            )}
          </div>

          {/* 3. 내 찜 목록 탭 */}
          <div className="tab-pane fade" id="like-pane" role="tabpanel" tabIndex="0">
            {likedPosts.content && likedPosts.content.length > 0 ? (
              <>
                <div className="row row-cols-1 row-cols-md-2 g-3">
                  {likedPosts.content.map(item => (
                    <div className="col" key={item.id}>
                      <Link to={`/service/items/detail/${item.id}`} className="text-decoration-none text-dark">
                        <div className="card h-100 border shadow-sm rounded p-2 flex-row align-items-center">
                          <img src={item.imageUrl} className="rounded" style={{ width: '80px', height: '80px', objectFit: 'cover' }} alt="상품 이미지" />
                          <div className="ms-3 overflow-hidden">
                            <h6 className="card-title text-truncate mb-1 fw-bold">{item.title}</h6>
                            <p className="card-text text-primary fw-bold mb-1">{Number(item.price).toLocaleString()}원</p>
                            <small className="text-muted">판매자: {item.sellerNickname}</small>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <Link to="/service/users/activities/like-list" className="btn btn-outline-secondary btn-sm px-5 rounded-pill">
                    내 찜 목록 전체보기 <i className="bi bi-chevron-right ms-1"></i>
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-5 text-center text-muted">
                <i className="bi bi-heartbreak fs-2 d-block mb-2"></i>
                <span>찜한 상품이 없습니다. 마음에 드는 상품을 찜해보세요!</span>
              </div>
            )}
          </div>

          {/* 4. 구매 채팅 탭 */}
          <div className="tab-pane fade" id="buy-pane" role="tabpanel" tabIndex="0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-bold">구매 협의 중 <span className="badge bg-secondary ms-1">{buyChatRooms.totalElements || 0}</span></h6>
              <button className="btn btn-link btn-sm text-muted text-decoration-none p-0" onClick={reloadPage}>
                목록 갱신 <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light text-center">
                  <tr>
                    <th className="text-start">상품명</th>
                    <th>판매자</th>
                    <th>채팅/후기 관리</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {buyChatRooms.content && buyChatRooms.content.length > 0 ? (
                    buyChatRooms.content.map(chat => (
                      <tr key={chat.roomId}>
                        <td className="text-start text-truncate fw-medium" style={{ maxWidth: '250px' }}>{chat.itemTitle}</td>
                        <td>{chat.partnerNickname}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-1">
                            <Link to={`/service/chat/room/${chat.roomId}`} className="btn btn-sm btn-primary px-3">입장</Link>
                            {chat.itemStatus === 'COMPLETED' && (
                              <Link to={`/service/reviews/write?itemId=${chat.itemId}`} className="btn btn-sm btn-outline-success">후기 남기기</Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-5 text-muted">진행 중인 구매 채팅이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {buyChatRooms.content && buyChatRooms.content.length > 0 && (
              <div className="text-center mt-3">
                <Link to="/service/users/activities/chats?role=BUYER" className="btn btn-outline-secondary btn-sm px-5 rounded-pill">
                  내 구매채팅 전체보기 <i className="bi bi-chevron-right ms-1"></i>
                </Link>
              </div>
            )}
          </div>

          {/* 5. 판매 채팅 탭 */}
          <div className="tab-pane fade" id="sell-pane" role="tabpanel" tabIndex="0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-bold">판매 협의 중 <span className="badge bg-secondary ms-1">{sellChatRooms.totalElements || 0}</span></h6>
              <button className="btn btn-link btn-sm text-muted text-decoration-none p-0" onClick={reloadPage}>
                목록 갱신 <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light text-center">
                  <tr>
                    <th className="text-start">상품명</th>
                    <th>구매자</th>
                    <th>채팅</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {sellChatRooms.content && sellChatRooms.content.length > 0 ? (
                    sellChatRooms.content.map(chat => (
                      <tr key={chat.roomId}>
                        <td className="text-start text-truncate fw-medium" style={{ maxWidth: '250px' }}>{chat.itemTitle}</td>
                        <td>{chat.partnerNickname}</td>
                        <td>
                          <Link to={`/service/chat/room/${chat.roomId}`} className="btn btn-sm btn-primary px-3">입장</Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-5 text-muted">진행 중인 판매 채팅이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {sellChatRooms.content && sellChatRooms.content.length > 0 && (
              <div className="text-center mt-3">
                <Link to="/service/users/activities/chats?role=SELLER" className="btn btn-outline-secondary btn-sm px-5 rounded-pill">
                  내 판매채팅 전체보기 <i className="bi bi-chevron-right ms-1"></i>
                </Link>
              </div>
            )}
          </div>

          {/* 6. 내가 쓴 후기 탭 */}
          <div className="tab-pane fade" id="written-review-pane" role="tabpanel" tabIndex="0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-bold">내가 작성한 거래 후기 <span className="badge bg-secondary ms-1">{writtenReviews.totalElements || 0}</span></h6>
            </div>
            {writtenReviews.content && writtenReviews.content.length > 0 ? (
              <>
                <div className="list-group gap-3">
                  {writtenReviews.content.map(review => (
                    <div className="list-group-item rounded border shadow-sm p-3 bg-white" key={review.id}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <span className="text-warning fw-bold">{'⭐'.repeat(review.rating)}</span>
                          <small className="badge bg-light text-dark border ms-2">거래 상품: {review.itemTitle}</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-muted">{review.createdAt ? review.createdAt.substring(2, 10) : ''}</small>
                          <Link to={`/service/reviews/edit/${review.id}`} className="btn btn-sm btn-outline-primary py-0 px-2" style={{ fontSize: '0.75rem' }}>수정</Link>
                          <button type="button" className="btn btn-sm btn-outline-danger py-0 px-2 delete-review-btn" onClick={() => handleDeleteReview(review.id)} style={{ fontSize: '0.75rem' }}>삭제</button>
                        </div>
                      </div>
                      <p className="mb-0 text-secondary small" style={{ whiteSpace: 'pre-wrap' }}>{review.content}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <Link to="/service/reviews/my" className="btn btn-outline-secondary btn-sm px-5 rounded-pill">
                    내가 쓴 후기 전체보기 <i className="bi bi-chevron-right ms-1"></i>
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-5 text-center text-muted">작성한 거래 후기가 없습니다.</div>
            )}
          </div>

          {/* 7. 내가 받은 후기 탭 */}
          <div className="tab-pane fade" id="received-review-pane" role="tabpanel" tabIndex="0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-bold">따뜻한 거래 칭찬 피드 <span className="badge bg-success ms-1">{receivedReviews.totalElements || 0}</span></h6>
            </div>
            {receivedReviews.content && receivedReviews.content.length > 0 ? (
              <>
                <div className="list-group gap-3">
                  {receivedReviews.content.map(review => (
                    <div className="list-group-item rounded border shadow-sm p-3 bg-light" key={review.id}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <img 
                            src={review.writerProfileUrl ? review.writerProfileUrl : '/images/default-profile.png'} 
                            className="rounded-circle border me-2" 
                            style={{ width: '30px', height: '30px', objectFit: 'cover' }} 
                            alt="작성자" 
                          />
                          <span className="fw-bold small me-2">{review.writerNickname}</span>
                          <span className="text-warning small">{'⭐'.repeat(review.rating)}</span>
                        </div>
                        <small className="text-muted">{review.createdAt ? review.createdAt.substring(2, 10) : ''}</small>
                      </div>
                      <p className="mb-1 text-secondary small" style={{ whiteSpace: 'pre-wrap' }}>{review.content}</p>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>거래 물품: {review.itemTitle}</small>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <Link to="/service/reviews/my?type=received" className="btn btn-outline-secondary btn-sm px-5 rounded-pill">
                    내가 받은 후기 전체보기 <i className="bi bi-chevron-right ms-1"></i>
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-5 text-center text-muted">아직 받은 거래 후기가 없습니다. 첫 후기를 기다려보세요!</div>
            )}
          </div>
        </div>

        {/* 리뷰 작성 모달 (React 상태 기반 제어) */}
        {isModalOpen && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} aria-hidden="false">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold" id="reviewModalLabel">거래 후기 작성</h5>
                  <button type="button" className="btn-close" onClick={closeReviewModal} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => { e.preventDefault(); handleReviewSubmit(); }}>
                    <input type="hidden" id="modalItemId" value={modalItemTitle} />

                    <div className="p-2 bg-light rounded mb-3">
                      <small className="text-muted d-block">거래 상품</small>
                      <span id="modalItemTitle" className="fw-bold text-dark">{modalItemTitle}</span>
                    </div>

                    <div className="mb-3 text-center">
                      <label className="form-label d-block fw-bold">거래 만족도</label>
                      <select 
                        className="form-select w-50 mx-auto text-center" 
                        id="modalRating"
                        value={modalRating} 
                        onChange={(e) => setModalRating(e.target.value)}
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
                        <option value="4">⭐⭐⭐⭐ (4점)</option>
                        <option value="3">⭐⭐⭐ (3점)</option>
                        <option value="2">⭐⭐ (2점)</option>
                        <option value="1">⭐ (1점)</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="modalContent" className="form-label fw-bold">따뜻한 거래 후기</label>
                      <textarea 
                        className="form-control" 
                        id="modalContent" 
                        rows="4" 
                        value={modalContent}
                        onChange={(e) => setModalContent(e.target.value)}
                        placeholder="따뜻한 거래 경험을 공유해주세요. (예: 친절하고 약속 시간을 잘 지켜요!)" 
                        required
                      ></textarea>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={closeReviewModal}>취소</button>
                  <button type="button" className="btn btn-primary btn-sm px-4" id="submitReviewBtn" onClick={handleReviewSubmit}>후기 등록하기</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default MyPage;