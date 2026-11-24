import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from '../../../api/api'; 
import { useAuth } from '../../../contexts/AuthContext';


export function useWithdrawConfirm() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const { handleLogout } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const trimmedPassword = password.trim();

    if (!trimmedPassword) {
      setErrors(["비밀번호를 입력해주세요."]);
      return;
    }

    // 탈퇴 재확인 얼럿
    if (!window.confirm("정말로 탈퇴하시겠습니까? 데이터는 정책에 따라 일정 기간 보관 후 삭제됩니다.")) {
      return;
    }

    try {
      const result = await Api.postRequest("/api/users/delete", { password: trimmedPassword }, "DELETE");

      if (result && result.isAvailable) {
        alert("그동안 이용해주셔서 감사합니다. 회원 탈퇴가 완료되었습니다.");
        await handleLogout();

      } else {
        setErrors([result.message || "회원 탈퇴에 실패했습니다."]);
        setPassword('');
      }
    } catch (error) {
      const errorList = error.message ? error.message.split("\n") : ["서버 오류가 발생했습니다."];
      setErrors(errorList);
      setPassword(''); // 에러 시 비밀번호 입력창 초기화
    }
  };

  return {
    password,
    setPassword,
    errors,
    handleSubmit
  };
}