import React from 'react';
import { Link } from 'react-router-dom';
import { useFindPassword } from './useFindPassword';
import '../user-common.css'; // 상위 users 폴더의 공통 CSS 연동
import './auth-find.css';   // 전용 CSS 연동

function FindPassword() {
  const {
    username,
    setUsername,
    email,
    setEmail,
    isSubmitted,
    successMessage,
    errorMessage,
    loading,
    handleSubmit
  } = useFindPassword();

  return (
    <div className="container mypage-container my-5" style={{ maxWidth: '500px' }}>
      <div className="card shadow-sm p-4 my-5 bg-white rounded border-0">
        <div className="card-body">

          {/* 1. 입력 폼 영역 (발송 전) */}
          {!isSubmitted ? (
            <div id="formSection">
              <div className="mb-4 text-center">
                <h4 className="fw-bold mb-1">비밀번호 찾기</h4>
                <small className="text-muted">가입하신 아이디와 이메일 정보를 입력해 주세요.</small>
              </div>

              {/* 에러 메시지 알림 박스 */}
              {errorMessage && (
                <div id="errorAlert" className="alert alert-danger small py-2 mb-3" role="alert">
                  {errorMessage}
                </div>
              )}

              <form id="findPasswordForm" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label small fw-bold text-secondary">아이디</label>
                  <input 
                    type="text" 
                    className="form-control auth-input" 
                    id="username" 
                    placeholder="아이디를 입력하세요" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label small fw-bold text-secondary">이메일</label>
                  <input 
                    type="email" 
                    className="form-control auth-input" 
                    id="email" 
                    placeholder="example@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  id="btnSend" 
                  className="btn btn-primary w-100 py-2 fw-medium mt-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      메일 발송 중...
                    </>
                  ) : (
                    '임시 비밀번호 발송'
                  )}
                </button>
              </form>

              <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center small">
                <Link to="/service/users/auth/find-username" className="text-secondary text-decoration-none">
                  아이디를 잊으셨나요?
                </Link>
                <Link to="/service/users/auth/login" className="text-primary fw-bold text-decoration-none">
                  로그인으로 돌아가기 <i className="bi bi-chevron-right ms-1"></i>
                </Link>
              </div>
            </div>
          ) : (
            /* 2. 성공 메시지 영역 (발송 후) */
            <div id="successSection" className="text-center py-3">
              <i className="bi bi-shield-lock-fill text-success display-4 mb-3 d-block"></i>
              <h4 className="fw-bold mb-2">임시 비밀번호 발송 완료</h4>
              <p className="text-muted small mb-4" id="successMessage">{successMessage}</p>
              <Link to="/users/login" className="btn btn-primary w-100 py-2 fw-medium text-decoration-none">
                로그인 페이지로 이동
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default FindPassword;