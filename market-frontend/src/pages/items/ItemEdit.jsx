import React from 'react';
import { Link } from 'react-router-dom';
import { useItemEdit } from './useItemEdit';
import ErrorAlert from '../../components/common/ErrorAlert';
import './edit.css'; // CSS 파일 임포트

function ItemEdit() {
  const {
    itemId,
    formData,
    categories,
    existingImages,
    errors,
    loading,
    handleChange,
    handleFileChange,
    handleRemoveExistingImage,
    handleSubmit
  } = useItemEdit();

  if (loading) return <div className="text-center my-5">로딩 중...</div>;

  return (
    <div className="container my-5">
      <h2>상품 수정</h2>

     <ErrorAlert errors={errors} />

      <form onSubmit={handleSubmit}>
        <input type="hidden" id="itemId" value={itemId} />
        <div className="row g-5">
          <div className="col-md-6">
            {/* 새 이미지 업로드 */}
            <div className="mb-4">
              <label htmlFor="images" className="form-label fw-bold">상품 이미지 (최대 5장)</label>
              <input 
                type="file" 
                id="images" 
                name="images" 
                className="form-control" 
                multiple 
                accept="image/*"
                onChange={handleFileChange}
              />
              <div id="image-preview-container" className="mt-3 d-flex flex-wrap gap-2"></div>
            </div>

            {/* 기존 등록된 이미지 관리 */}
            <div className="mb-4">
              <label className="form-label fw-bold">기존 등록된 이미지 <span className="text-muted fw-normal fs-7">(클릭 시 삭제)</span></label>
              <div className="d-flex flex-wrap gap-2">
                {existingImages.map((img) => (
                  <div 
                    key={img.id}
                    className="position-relative existing-image-card rounded border btn-remove-img"
                    onClick={() => handleRemoveExistingImage(img.id)}
                    style={{ cursor: 'pointer', width: '100px', height: '100px' }}
                  >
                    <img src={img.url} className="w-100 h-100" style={{ objectFit: 'cover' }} alt="기존상품이미지" />
                    <div className="image-delete-overlay">
                      <i className="bi bi-trash3-fill fs-4 mb-1"></i> 
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>삭제</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            {/* 카테고리 선택 */}
            <div className="mb-4">
              <label htmlFor="categoryId" className="form-label fw-bold">카테고리</label>
              <select 
                className="form-select" 
                id="categoryId" 
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">-- 카테고리 선택 --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 상품 제목 */}
            <div className="mb-4">
              <label htmlFor="title" className="form-label fw-bold">상품 제목</label>
              <input 
                type="text" 
                className="form-control form-control-lg" 
                id="title" 
                name="title"
                value={formData.title} 
                onChange={handleChange}
                placeholder="제목을 입력하세요" 
              />
            </div>

            {/* 가격 */}
            <div className="mb-4">
              <label htmlFor="price" className="form-label fw-bold">가격 (원)</label>
              <input 
                type="number" 
                className="form-control" 
                id="price" 
                name="price"
                step="1000"
                value={formData.price} 
                onChange={handleChange}
                placeholder="가격을 입력하세요" 
              />
            </div>

            {/* 상품 설명 */}
            <div className="mb-4">
              <label htmlFor="content" className="form-label fw-bold">상품 설명</label>
              <textarea 
                className="form-control" 
                id="content" 
                name="content" 
                rows="8"
                value={formData.content} 
                onChange={handleChange}
                placeholder="내용을 입력하세요"
              ></textarea>
            </div>

            {/* 버튼 영역 */}
            <div className="d-flex gap-2 mt-5">
              <button type="submit" className="btn btn-primary px-5 fw-bold">수정 완료</button>
              <Link to={`/items/detail/${itemId}`} className="btn btn-outline-secondary px-4">취소</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ItemEdit;