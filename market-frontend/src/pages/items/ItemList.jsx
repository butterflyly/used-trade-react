import React from 'react';
import { Link } from 'react-router-dom';
import 'dayjs/locale/ko';
import { useItemList } from './useItemList';
import './list.css';

function ItemList() {
  const {
    itemsData,
    categories,
    categoryId,
    categoryName,
    currentUser,
    searchType,
    keywordInput,
    setKeywordInput,
    sort,
    loading,
    handleCategoryChange,
    handleSearchSubmit,
    handleFilterChange,
    handlePageChange,
    handleRestrictedWriteClick,
    formatRelativeTime,
    handleSearchTypeChange
  } = useItemList();

  const items = itemsData.content || [];

  return (
    <div className="container my-5">
      {/* 상단 타이틀 및 글쓰기 버튼 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
       
        <h1 className="h3 mb-0 text-dark fw-bold">
          상품 목록 ({categoryName})
        </h1>
      </div>

      {/* 카테고리 필터 셀렉트박스 */}
      <div className="d-flex justify-content-between align-items-end mb-4">
      <div className="category-filter-wrapper">
        <div style={{ maxWidth: '200px' }}>
          <select
            className="form-select border-secondary-subtle"
            value={categoryId || ''}
            onChange={handleCategoryChange}
          >
            <option value="">전체 카테고리</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentUser && Number(currentUser.warningCount ?? 0) < 2 && (
        <Link
          to={`/service/items/create${categoryId ? `?categoryId=${categoryId}` : ''}`}
          className="btn btn-primary btn-sm px-3 py-2 w-auto"
          style={{ width: 'auto', minWidth: '0', flex: '0 0 auto' }}
                  >
          <i className="bi bi-plus-lg me-1"></i>
          새 상품 등록
        </Link>
      )}

      {currentUser && Number(currentUser.warningCount ?? 0) >= 2 && (
        <button
          onClick={handleRestrictedWriteClick}
           className="btn btn-primary btn-sm px-3 py-2 w-auto"
          style={{ width: 'auto', minWidth: '0', flex: '0 0 auto' }}
        >
          글쓰기 제한됨
        </button>
      )}
    </div>

      {/* 검색 바 */}
      <div className="search-wrapper mb-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="input-group">
            <select
              name="searchType"
              value={searchType}
              onChange={handleSearchTypeChange}
              className="form-select"
          >
              <option value="title">제목</option>
              <option value="titleAndContent">제목 + 내용</option>
              <option value="nickname">닉네임</option>
          </select>

            <input 
              type="text" 
              name="kw" 
              className="form-control border-secondary-subtle"
              placeholder="어떤 상품을 찾으시나요?" 
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
            />

            <button className="btn btn-outline-secondary px-4" type="submit">
              <i className="bi bi-search"></i> 검색
            </button>
          </div>
        </form>
      </div>

      {/* 정렬 필터 탭 */}
      <div className="d-flex align-items-center gap-3 mb-4 p-2 bg-light rounded">
        <small className="text-muted fw-bold ps-2">정렬</small>
        <div className="nav nav-pills gap-1">
          <button 
            type="button" 
            onClick={() => handleFilterChange('latest')}
            className={`nav-link btn-sm py-1 px-3 ${!sort || sort === 'latest' ? 'active' : ''}`}
          >
            최신순
          </button>
          <button 
            type="button" 
            onClick={() => handleFilterChange('views')}
            className={`nav-link btn-sm py-1 px-3 ${sort === 'views' ? 'active' : ''}`}
          >
            인기순
          </button>
          <button 
            type="button" 
            onClick={() => handleFilterChange('priceAsc')}
            className={`nav-link btn-sm py-1 px-3 ${sort === 'priceAsc' ? 'active' : ''}`}
          >
            낮은 가격순
          </button>
          <button 
            type="button" 
            onClick={() => handleFilterChange('priceDesc')}
            className={`nav-link btn-sm py-1 px-3 ${sort === 'priceDesc' ? 'active' : ''}`}
          >
            높은 가격순
          </button>
        </div>
      </div>

      {/* 상품 카드 목록 그리드 */}
      {loading ? (
        <div className="text-center my-5">목록을 불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center my-5 text-muted">등록된 상품이 없습니다.</div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-x-3 g-y-3">
          {items.map((item) => (
            <div className="col" key={item.id}>
              <Link to={`/service/items/detail/${item.id}`} className="text-decoration-none text-dark">
                <div className="card h-100 item-card border-0 shadow-sm soft-card">
                  <div className="card-img-wrapper position-relative">
                    <img src={item.imageUrl} className="card-img-top-abs" alt="상품이미지" />
                  </div>
                  <div className="card-body p-3">
                    <h5 className="card-title text-ellipsis mb-1">{item.title}</h5>
                    <p className="card-text price-text mb-1">
                      {Number(item.price).toLocaleString()}원
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: '0.85rem' }}>
                      <span className="text-muted text-ellipsis" style={{ maxWidth: '100px' }}>
                        {item.sellerNickname}
                      </span>
                      <div className="d-flex align-items-center gap-1 text-muted flex-shrink-0">
                        <span className="text-black-50" style={{ fontSize: '0.75rem' }}>·</span>
                        <span><i className="bi bi-eye"></i> {item.views}</span>
                        <span className="text-black-50" style={{ fontSize: '0.75rem' }}>·</span>
                        <span className="item-date">{formatRelativeTime(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {itemsData.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-5">
          <nav aria-label="Page navigation">
            <ul className="pagination">
              {/* 이전 페이지 버튼 */}
              <li className={`page-item ${itemsData.first ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(itemsData.number - 1)}
                  disabled={itemsData.first}
                >
                  &laquo;
                </button>
              </li>

              {/* 페이지 번호 목록 */}
              {Array.from({ length: itemsData.totalPages }, (_, i) => i)
                .filter(pageIdx => pageIdx >= itemsData.number - 2 && pageIdx <= itemsData.number + 2)
                .map(pageIdx => (
                  <li key={pageIdx} className={`page-item ${pageIdx === itemsData.number ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(pageIdx)}>
                      {pageIdx + 1}
                    </button>
                  </li>
                ))}

              {/* 다음 페이지 버튼 */}
              <li className={`page-item ${itemsData.last ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(itemsData.number + 1)}
                  disabled={itemsData.last}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

export default ItemList;