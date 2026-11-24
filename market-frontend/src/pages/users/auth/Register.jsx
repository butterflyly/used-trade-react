import React from 'react';
import { useRegister } from './useRegister';
import ErrorAlert from '../../../components/common/ErrorAlert';
import '../user-common.css';
import './register.css';

function Register() {
  const {
    formData,
    fieldStatus,
    previewUrl,
    fileInputRef,
    passwordError,
    passwordConfirmError,
    errors,
    handleChange,
    handleImageClick,
    handleFileChange,
    checkDuplicateUsername,
    checkDuplicateNickname,
    sendEmailAuth,
    verifyEmailCode,
    changeUsername,
    changeNickname,
    changeEmail,
    handleSubmit
  } = useRegister();

  return (
    <div className="container my-5">
      <div className="auth-card">
        <h3 className="register-title">회원가입</h3>

        {/* 공통 에러 컴포넌트를 한 줄로 재사용! */}
        <ErrorAlert errors={errors} />

        <form onSubmit={handleSubmit}>
    
          {/* 프로필 이미지 업로드 영역 */}
          <div className="form-group text-center mb-4">
            <div 
              className="profile-upload-wrapper" 
              id="profileUploadTrigger" 
              onClick={handleImageClick}
              style={{ cursor: 'pointer' }}
            >
              <img 
                id="profilePreview" 
                src={previewUrl} 
                alt="프로필 미리보기"
                style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd' }}
              />

              <div className="upload-hint" style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '8px' }}>
                프로필 이미지 선택 (클릭)<br />
                <span style={{ fontSize: '0.75rem', color: '#b5b5b5' }}>미등록 시 기본 이미지로 설정됩니다.</span>
              </div>
            </div>
            <input 
              type="file" 
              id="profileImage" 
              name="profileImage" 
              ref={fileInputRef}
              accept="image/*" 
              onChange={handleFileChange}
              style={{ display: 'none' }} 
            />
          </div>

          {/* 아이디 입력 */}
          <div className="form-group">
            <div className="input-with-button">
              <input 
                type="text" 
                id="username" 
                name="username" 
                placeholder="아이디(영문 또는 숫자 6 ~ 15글자)" 
                className="auth-input"
                value={formData.username}
                onChange={handleChange}
                readOnly={fieldStatus.username.readOnly}
              />
              <button 
                type="button" 
                className="checkIdBtn" 
                id="duplicateCheckUsernameButton"
                style={{ display: fieldStatus.username.readOnly ? 'none' : 'inline-block' }}
                onClick={checkDuplicateUsername}
              >
                중복 확인
              </button>
              <button 
                type="button" 
                className="changeBtn" 
                id="changeUsernameButton" 
                style={{ display: fieldStatus.username.readOnly ? 'inline-block' : 'none' }}
                onClick={changeUsername}
              >
                변경
              </button>
            </div>
            <div 
              className={fieldStatus.username.success ? "msg-success" : "msg-error"} 
              id="username-error"
              style={{ display: fieldStatus.username.message ? 'block' : 'none' }}
            >
              {fieldStatus.username.message}
            </div>
          </div>

          {/* 비밀번호 입력 */}
          <div className="form-group">
            <input 
              type="password" 
              id="passwordInput" 
              name="passwordInput" 
              placeholder="비밀번호(영문+숫자 포함 8 ~ 16글자)" 
              className={`auth-input ${passwordError ? 'error-input' : ''}`}
              value={formData.passwordInput}
              onChange={handleChange}
            />
            <div 
              className="msg-error" 
              id="passwordInput-error"
              style={{ display: passwordError ? 'block' : 'none' }}
            >
              {passwordError}
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <input 
              type="password" 
              id="passwordConfirm" 
              name="passwordConfirm" 
              placeholder="비밀번호 확인" 
              className={`auth-input ${passwordConfirmError ? 'error-input' : ''}`}
              value={formData.passwordConfirm}
              onChange={handleChange}
            />
            <div 
              className="msg-error" 
              id="passwordConfirm-error"
              style={{ display: passwordConfirmError ? 'block' : 'none' }}
            >
              {passwordConfirmError}
            </div>
          </div>

          {/* 닉네임 입력 */}
          <div className="form-group">
            <div className="input-with-button">
              <input 
                type="text" 
                id="nickname" 
                name="nickname" 
                placeholder="닉네임" 
                className="auth-input"
                value={formData.nickname}
                onChange={handleChange}
                readOnly={fieldStatus.nickname.readOnly}
              />
              <button 
                type="button" 
                id="duplicateCheckNicknameButton" 
                className="checkIdBtn"
                style={{ display: fieldStatus.nickname.readOnly ? 'none' : 'inline-block' }}
                onClick={checkDuplicateNickname}
              >
                중복 확인
              </button>
              <button 
                type="button" 
                id="changeNicknameButton" 
                className="changeBtn" 
                style={{ display: fieldStatus.nickname.readOnly ? 'inline-block' : 'none' }}
                onClick={changeNickname}
              >
                변경
              </button>
            </div>
            <div 
              className={fieldStatus.nickname.success ? "msg-success" : "msg-error"} 
              id="nickname-error"
              style={{ display: fieldStatus.nickname.message ? 'block' : 'none' }}
            >
              {fieldStatus.nickname.message}
            </div>
          </div>

          {/* 이메일 입력 */}
          <div className="form-group">
            <div className="input-with-button">
              <input 
                type="email" 
                id="email" 
                name="email"
                className="auth-input" 
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
                readOnly={fieldStatus.email.readOnly}
              />
              <button 
                type="button" 
                id="duplicateCheckEmailButton" 
                className="checkIdBtn"
                style={{ display: fieldStatus.email.readOnly ? 'none' : 'inline-block' }}
                onClick={sendEmailAuth}
              >
                인증번호 전송
              </button>
              <button 
                type="button" 
                id="changeEmailButton" 
                className="changeBtn" 
                style={{ display: fieldStatus.email.readOnly ? 'inline-block' : 'none' }}
                onClick={changeEmail}
              >
                변경
              </button>
            </div>
            <div 
              id="email-error" 
              className={fieldStatus.email.success ? "msg-success" : "msg-error"}
              style={{ display: fieldStatus.email.message ? 'block' : 'none' }}
            >
              {fieldStatus.email.message}
            </div>
          </div>

          {/* 인증번호 입력 */}
          <div className="form-group">
            <div className="input-with-button">
              <input 
                type="text" 
                id="inputCode" 
                name="inputCode"
                className="auth-input" 
                placeholder="인증번호"
                value={formData.inputCode}
                onChange={handleChange}
                readOnly={fieldStatus.inputCode.readOnly}
              />
              <button 
                type="button" 
                id="duplicateCheckInputCodeButton" 
                className="checkIdBtn"
                style={{ display: fieldStatus.inputCode.readOnly ? 'none' : 'inline-block' }}
                onClick={verifyEmailCode}
              >
                인증확인
              </button>
            </div>
            <div 
              id="inputCode-error" 
              className={fieldStatus.inputCode.success ? "msg-success" : "msg-error"}
              style={{ display: fieldStatus.inputCode.message ? 'block' : 'none' }}
            >
              {fieldStatus.inputCode.message}
            </div>
          </div>

          <button type="submit" id="submitRegisterButton" className="btn btn-primary w-100 mt-3">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;