import React from 'react';
import { Link } from 'react-router-dom';
import { useMyBuyItems } from './useMyBuyItems';
import '../user-common.css';

function MyBuyItems() {
  const {
    loading,
    itemsData,
    pageTitle,
    handlePageChange
  } = useMyBuyItems();

  const items = itemsData.content || [];

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Upper Header Area */}
        <div className="d-flex align-items-center mb-4">
          <Link to="/service/users/profile/mypage" className="btn btn-outline-secondary btn-sm me-3">
            <i className="bi bi-arrow-left"></i> 마이페이지
          </Link>
          <h4 className="mb-0 fw-bold">{pageTitle}</h4>
        </div>

        {loading ? (
          <div className="text-center py-5">Dintlha di a laolwa...</div>
        ) : (
          <>
            {/* Purchase Item List */}
            {items.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-2 g-3">
                {items.map((item) => (
                  <div className="col" key={item.id}>
                    <Link to={`/service/items/detail/${item.id}`} className="text-decoration-none text-dark">
                      <div className="card h-100 border shadow-sm rounded p-2 flex-row align-items-center">
                        <img 
                          src={item.imageUrl ? item.imageUrl : '/images/default-item.png'}
                          className="rounded flex-shrink-0"
                          style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                          alt="구매 상품 이미지"
                        />
                        <div className="ms-3 overflow-hidden">
                          <h6 className="card-title text-truncate mb-1 fw-bold">{item.title}</h6>
                          <p className="card-text text-primary fw-bold mb-1">
                            {Number(item.price).toLocaleString()}원
                          </p>
                          <small className="text-muted">{item.createdAt}</small>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              /* No Purchase History */
              <div className="card border-0 shadow-sm p-5 text-center text-muted">
                <i className="bi bi-bag-x fs-1 d-block mb-2"></i>
                구매한 상품이 없습니다.
              </div>
            )}

            {/* Pagination Navigation */}
            {itemsData.totalPages > 1 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  {/* Previous Page Button */}
                  <li className={`page-item ${itemsData.first ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(itemsData.number - 1)}
                      disabled={itemsData.first}
                    >
                      이전
                    </button>
                  </li>

                  {/* Page Numbers */}
                  {Array.from({ length: itemsData.totalPages }, (_, i) => i)
                    .filter(pageIdx => pageIdx >= itemsData.number - 2 && pageIdx <= itemsData.number + 2)
                    .map((pageNumber) => (
                      <li key={pageNumber} className={`page-item ${pageNumber === itemsData.number ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber + 1}
                        </button>
                      </li>
                    ))}

                  {/* Next Page Button */}
                  <li className={`page-item ${itemsData.last ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(itemsData.number + 1)}
                      disabled={itemsData.last}
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

export default MyBuyItems;