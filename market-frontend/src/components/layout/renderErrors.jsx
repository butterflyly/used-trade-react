import React, { useState } from 'react';
import Api from '../api'; 

function ItemRegisterPage() {
  // 1. 에러 메시지 배열을 관리할 리액트 State 선언
  const [errors, setErrors] = useState([]);

  // 상품 등록 등 폼 전송 핸들러 예시
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]); // 기존 에러 초기화

    try {
      // Api.postRequest 활용
      await Api.postRequest("/api/items/new", { /* 보낼 데이터 */ });
      alert("상품 등록 성공!");
    } catch (error) {
      // 2. 서버에서 에러가 날 경우, 메시지를 쪼개서 State에 꽂아넣기
      // (서버가 줄바꿈 문자('\n')로 에러들을 묶어 보낸다면 split으로 쪼갬)
      const errorMessages = error.message.split('\n');
      setErrors(errorMessages);

      // 3. 기존에 쓰시던 상단 스크롤 유도 기능은 그대로 적용 가능!
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="container my-4">
      <h2>상품 등록 페이지</h2>

      {/* 4. DOM을 직접 만들지 않고, errors 상태가 있을 때만 JSX 영역이 화면에 렌더링되도록 처리 */}
      {errors.length > 0 && (
        <div id="error-container" style={{ display: 'block', backgroundColor: '#f8d7da', padding: '15px', marginBottom: '20px' }}>
          <div id="error-messages">
            {errors.map((msg, index) => (
              <div key={index} className="error-item text-danger">
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 실제 폼 입력 영역 */}
      <form onSubmit={handleSubmit}>
        {/* 입력 필드들... */}
        <button type="submit" className="btn btn-primary">등록하기</button>
      </form>
    </div>
  );
}

export default ItemRegisterPage;