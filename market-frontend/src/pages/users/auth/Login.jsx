import React from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from './useLogin';
import './login.css';    
import '../user-common.css';

function Login() {
  const {
    formData,
    errorMessage,
    BACKEND_URL,
    handleChange,
    handleSubmit,
    googleLoginUrl,
    naverLoginUrl
  } = useLogin();

  return (
    <div className="container my-5">
      <div className="auth-card">
        <h3 className="register-title">로그인</h3>
        <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '30px' }}>
          서비스 이용을 위해 아이디와 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              id="username" 
              name="username"
              className="auth-input" 
              placeholder="아이디" 
              value={formData.username}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <input 
              type="password" 
              id="password" 
              name="password"
              className="auth-input" 
              placeholder="비밀번호" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
            {errorMessage && (
              <div id="loginErrorMessage" className="msg-error" style={{ display: 'block' }}>
                {errorMessage}
              </div>
            )}
          </div>

          <div className="form-group login-options">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                id="rememberMe" 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span className="checkbox-text">로그인 상태 유지</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary">
            로그인
          </button>

        <div className="auth-footer d-flex flex-column align-items-center gap-3">
          <Link to="/service/users/auth/register">
            아직 회원이 아니신가요? <span>회원가입</span>
          </Link>

          <div className="d-flex justify-content-center align-items-center gap-3">
            <Link to="/service/users/auth/find-username" className="text-muted text-decoration-none">
              아이디 찾기
            </Link>

            <span className="text-muted">|</span>

            <Link to="/service/users/auth/find-password" className="text-muted text-decoration-none">
              비밀번호 찾기
            </Link>
          </div>
        </div>

          <div className="d-flex flex-column gap-2 mt-4">
            <a href={googleLoginUrl} className="btn btn-outline-dark w-100 fw-bold py-2 text-decoration-none text-center">
              <img src="/images/google-icon.png" style={{ width: '18px', marginRight: '8px' }} alt="Google" /> Google 계정으로 로그인
            </a>

            <a href={naverLoginUrl} className="btn btn-success w-100 fw-bold py-2 text-decoration-none text-center" style={{ backgroundColor: '#03C75A', border: 'none' }}>
              <i className="bi bi-chat-fill me-2"></i> 네이버 아이디로 로그인
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;