import React from 'react';
import { Link } from 'react-router-dom';
import { useUserUpdate } from './useUserUpdate';
import '../user-common.css'; // 상위 users 폴더의 공통 CSS 적용

function UserUpdate() {
  const {
    loading,
    nickname,
    setNickname,
    previewUrl,
    errors,
    handleFileChange,
    handleSubmit
  } = useUserUpdate();

  if (loading) return <div className="text-center my-5">로딩 중...</div>;

  return (
    <div className="container my-5">
      <div className="auth-card" style={{ maxWidth: '450px', margin: '0 auto' }}>
        <h3 className="register-title">프로필 수정</h3>

      <div className="text-center mb-4">
      <div className="position-relative d-inline-block">
        <img
          id="profilePreview"
          src={previewUrl}
          className="rounded-circle border shadow-sm"
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'cover'
          }}
          alt="프로필 미리보기"
        />

        <label
          htmlFor="profileImage"
          className="position-absolute d-flex align-items-center justify-content-center bg-primary text-white rounded-circle shadow"
          style={{
            width: '36px',
            height: '36px',
            right: '0',
            bottom: '0',
            cursor: 'pointer',
            border: '3px solid white',
            zIndex: 1
          }}
        >
          <i className="fa-solid fa-camera"></i>
        </label>

        <input
          type="file"
          id="profileImage"
          name="profileImage"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <p className="text-muted small mt-2">프로필 사진 변경</p>
    </div>

        <form id="updateForm" onSubmit={handleSubmit}>
          {/* 에러 메시지 영역 (상태 기반 조건부 렌더링) */}
          <div 
            id="error-container" 
            className="alert alert-danger" 
            style={{ display: errors.length > 0 ? 'block' : 'none' }} 
            role="alert"
          >
            <ul id="error-messages" className="mb-0">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>

          <div className="form-group mb-4">
            <label className="form-label fw-bold">닉네임</label>
            <input 
              type="text" 
              id="nickname" 
              className="auth-input form-control" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required 
            />
          </div>

          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">저장하기</button>
            <Link to="/users/mypage" className="btn btn-link text-secondary text-decoration-none text-center">
              마이페이지로 돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserUpdate;