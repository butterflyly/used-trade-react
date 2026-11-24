import React from 'react';
import { Link } from 'react-router-dom';
import { useMyChats } from './useMyChats';
import '../user-common.css';

function MyChats() {
  const {
    loading,
    chatsData,
    currentRole,
    handleRoleChange,
    handlePageChange
  } = useMyChats();

  const chats = chatsData.content || [];

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="d-flex align-items-center mb-4">
          <Link to="/service/users/profile/mypage" className="btn btn-outline-secondary btn-sm me-3">
            <i className="bi bi-arrow-left"></i> 마이페이지
          </Link>
          <h4 className="mb-0 fw-bold">내 채팅 목록</h4>
        </div>

        {/* Upper Purchase/Sale Filter Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              type="button"
              className={`nav-link ${currentRole === 'BUYER' ? 'active fw-bold' : ''}`}
              onClick={() => handleRoleChange('BUYER')}
            >
              구매 채팅 목록
            </button>
          </li>
          <li className="nav-item">
            <button 
              type="button"
              className={`nav-link ${currentRole === 'SELLER' ? 'active fw-bold' : ''}`}
              onClick={() => handleRoleChange('SELLER')}
            >
              판매 채팅 목록
            </button>
          </li>
        </ul>

        {loading ? (
          <div className="text-center py-5">Dintlha di a laolwa...</div>
        ) : (
          <>
            {/* Chat List Table */}
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light text-center">
                    <tr>
                      <th className="text-start ps-4">상품명</th>
                      <th>{currentRole === 'BUYER' ? '판매자' : '구매자'}</th>
                      <th>입장</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {chats.length > 0 ? (
                      chats.map((chat) => (
                        <tr key={chat.roomId}>
                          <td className="text-start ps-4 text-truncate fw-medium" style={{ maxWidth: '300px' }}>
                            {chat.itemTitle}
                          </td>
                          <td>{chat.partnerNickname}</td>
                          <td>
                            <Link to={`/chat/room/${chat.roomId}`} className="btn btn-sm btn-primary px-3">
                              대화하기
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-5 text-muted">
                          진행 중인 채팅 목록이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Navigation */}
            {chatsData.totalPages > 1 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${chatsData.first ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(chatsData.number - 1)}
                      disabled={chatsData.first}
                    >
                      이전
                    </button>
                  </li>

                  {Array.from({ length: chatsData.totalPages }, (_, i) => i)
                    .filter(pageIdx => pageIdx >= chatsData.number - 2 && pageIdx <= chatsData.number + 2)
                    .map((pageNumber) => (
                      <li key={pageNumber} className={`page-item ${pageNumber === chatsData.number ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber + 1}
                        </button>
                      </li>
                    ))}

                  <li className={`page-item ${chatsData.last ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(chatsData.number + 1)}
                      disabled={chatsData.last}
                    >
                      다음
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyChats;