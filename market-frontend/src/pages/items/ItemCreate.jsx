import React from 'react';
import { useItemCreate } from './useItemCreate';
import ErrorAlert from '../../components/common/ErrorAlert'; 

function ItemCreate() {
  // 로직 훅을 호출해서 필요한 함수와 상태만 꺼내 씀
  const { formData, categories, errors, handleChange, handleFileChange, handleSubmit } = useItemCreate();

  return (
    <div className="container my-5">
      <h2>상품 등록</h2>

     <ErrorAlert errors={errors} />

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">제목</label>
          <input type="text" id="title" name="title" className="form-control" value={formData.title} onChange={handleChange} />
        </div>

        <div className="mb-3">
            <label htmlFor="price" className="form-label">가격</label>
            <input type="number" id="price" name="price"
             className="form-control" min="0" step="1000" value={formData.price} onChange={handleChange}/>
        </div>

        <div className="mb-3">
            <label htmlFor="content" className="form-label">내용</label>
            <textarea id="content" name="content" className="form-control" rows="10" value={formData.content} onChange={handleChange} ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="images" className="form-label">상품 이미지 (최대 5장)</label>
          <input 
             type="file" 
             id="images" 
             name="images" 
             className="form-control" 
             multiple 
             accept="image/*"
             onChange={handleFileChange} 
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="categoryId" className="form-label">카테고리</label>
          <select 
            id="categoryId" 
            name="categoryId" 
            className="form-select"
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
        
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">등록</button>
        </div>
      </form>
    </div>
  );
}

export default ItemCreate;