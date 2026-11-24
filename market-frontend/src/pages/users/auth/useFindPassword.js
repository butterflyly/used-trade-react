import { useState } from 'react';
import Api from '../../../api/api';

export function useFindPassword() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const result = await Api.postRequest('/api/users/find-password', {
        username: username.trim(),
        email: email.trim()
      });

      if (result && result.isAvailable) {
        setSuccessMessage(result.message || '입력하신 이메일로 임시 비밀번호를 발송했습니다.');
        setIsSubmitted(true);
      } else {
        setErrorMessage(result?.message || '입력하신 회원 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('비밀번호 찾기 요청 실패:', error);
      setErrorMessage(error.message || '서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    isSubmitted,
    successMessage,
    errorMessage,
    loading,
    handleSubmit
  };
}