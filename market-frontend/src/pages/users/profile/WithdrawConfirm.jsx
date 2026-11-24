import React from 'react';
import { Link } from 'react-router-dom';
import { useWithdrawConfirm } from './useWithdrawConfirm';
import '../user-common.css'; // 상위 users 폴더의 공통 CSS 연동

function WithdrawConfirm() {
  const {
    password,
    setPassword,
    errors,
    handleSubmit
  } = useWithdrawConfirm();

  return (
    <div className="container my-5">
      <div 
        className="auth-card border-danger" 
        style={{ maxWidth: '450px', margin: '0 auto', borderTop: '5px solid #dc3545' }}
      >
        <h3 className="register-title text-danger">회원 탈퇴</h3>
        <div className="alert alert-light border-0 text-center" style={{ backgroundColor: '#f8f9fa' }}>
          <p className="text-dark fw-bold mb-1">정말 서비스를 떠나시나요?</p>
          <p className="text-muted small mb-0">
            탈퇴 시 계정은 즉시 <strong>비활성화</strong>됩니다.<br />
            (단, 개인정보 보호 정책에 따라 30일 이내에 복구 신청이 가능합니다.)
          </p>
        </div>

        <form id="withdrawForm" className="mt-4" onSubmit={handleSubmit}>
          {/* 에러 메시지 알림 박스 */}
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
            <label className="form-label fw-bold text-dark">비밀번호 확인</label>
            <input 
              type="password" 
              id="password" 
              className="auth-input form-control" 
              placeholder="현재 비밀번호를 입력해주세요" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-danger py-2">회원 탈퇴 확정</button>
            <Link to="/users/mypage" className="btn btn-light border text-center text-decoration-none py-2">
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WithdrawConfirm;