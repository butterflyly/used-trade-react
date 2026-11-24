import React from 'react';
import { Link } from 'react-router-dom';
import { usePasswordUpdate } from './usePasswordUpdate';
import '../user-common.css'; // 상위 users 폴더의 공통 CSS 연동

function PasswordUpdate() {
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    handleNewPasswordChange,
    confirmNewPassword,
    handleConfirmChange,
    newPasswordError,
    confirmError,
    errors,
    isNewPasswordValid,
    isConfirmValid,
    handleSubmit
  } = usePasswordUpdate();

  return (
    <div className="container my-5">
      <div className="auth-card" style={{ maxWidth: '450px', margin: '0 auto' }}>
        <h3 className="register-title">비밀번호 변경</h3>
        <p className="text-center text-muted mb-4" style={{ fontSize: '14px' }}>
          안전을 위해 현재 비밀번호와 새 비밀번호를 입력해주세요.
        </p>

        <form id="passwordForm" onSubmit={handleSubmit}>
          {/* 전역 에러 알림 영역 */}
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

          <div className="form-group mb-3">
            <label className="form-label fw-bold">현재 비밀번호</label>
            <input 
              type="password" 
              id="currentPassword" 
              className="auth-input form-control" 
              placeholder="현재 비밀번호 입력" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required 
            />
          </div>

          <hr className="my-4" />

          <div className="form-group mb-3">
            <label className="form-label fw-bold">새 비밀번호</label>
            <input 
              type="password" 
              id="newPassword" 
              className={`auth-input form-control ${!isNewPasswordValid && newPassword ? 'error-input' : ''}`} 
              placeholder="새 비밀번호 입력" 
              value={newPassword}
              onChange={handleNewPasswordChange}
              required 
            />
            {newPasswordError && (
              <div id="newPasswordError" className="msg-error" style={{ color: '#dc3545', fontSize: '13px', marginTop: '5px' }}>
                {newPasswordError}
              </div>
            )}
          </div>

          <div className="form-group mb-4">
            <label className="form-label fw-bold">새 비밀번호 확인</label>
            <input 
              type="password" 
              id="confirmNewPassword" 
              className={`auth-input form-control ${!isConfirmValid && confirmNewPassword ? 'error-input' : ''}`} 
              placeholder="새 비밀번호 다시 입력" 
              value={confirmNewPassword}
              onChange={handleConfirmChange}
              required 
            />
            {confirmError && (
              <div id="confirmPasswordError" className="msg-error" style={{ color: '#dc3545', fontSize: '13px', marginTop: '5px' }}>
                {confirmError}
              </div>
            )}
          </div>

          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary py-2">비밀번호 변경</button>
            <Link to="/users/mypage" className="btn btn-outline-secondary text-center text-decoration-none py-2">
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordUpdate;