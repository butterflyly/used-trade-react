import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from '../../../api/api';
import { useAuth } from '../../../contexts/AuthContext';

export function usePasswordUpdate() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [errors, setErrors] = useState([]);

  const [isNewPasswordValid, setIsNewPasswordValid] = useState(false);
  const [isConfirmValid, setIsConfirmValid] = useState(false);
  const { handleLogout } = useAuth();

  // 1. 새 비밀번호 정규식 체크 핸들러
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    const regex = /^(?=.*[a-zA-Z])(?=.*\d).{12,}$/;

    if (!regex.test(value)) {
      setNewPasswordError("영문 + 숫자 포함 12자 이상이어야 합니다.");
      setIsNewPasswordValid(false);
    } else {
      setNewPasswordError('');
      setIsNewPasswordValid(true);
    }

    // 값 변경 시 확인란과의 일치 여부도 실시간 동기화 체크
    if (confirmNewPassword && value !== confirmNewPassword) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
      setIsConfirmValid(false);
    } else if (confirmNewPassword) {
      setConfirmError('');
      setIsConfirmValid(true);
    }
  };

  // 2. 새 비밀번호 확인 일치 체크 핸들러
  const handleConfirmChange = (e) => {
    const value = e.target.value;
    setConfirmNewPassword(value);

    if (newPassword !== value) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
      setIsConfirmValid(false);
    } else {
      setConfirmError('');
      setIsConfirmValid(true);
    }
  };

  // 3. 최종 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!isNewPasswordValid || !isConfirmValid) {
      setErrors(["비밀번호 형식을 다시 확인해주세요."]);
      window.scrollTo(0, 0);
      return;
    }

    if (!currentPassword) {
      setErrors(["현재 비밀번호를 입력해주세요."]);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const result = await Api.postRequest("/api/users/update-password", {
        currentPassword,
        newPassword,
        confirmNewPassword
      }, "PUT");

      if (result && result.isAvailable) {
        alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
        await handleLogout();
      } else {
        setErrors([result.message || "비밀번호 변경에 실패했습니다."]);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      const errorList = error.message ? error.message.split("\n") : ["서버 오류가 발생했습니다."];
      setErrors(errorList);
      window.scrollTo(0, 0);
    }
  };

  return {
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
  };
}