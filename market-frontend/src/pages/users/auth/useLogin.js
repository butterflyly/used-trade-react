import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Api from '../../../api/api';
import { useAuth } from '../../../contexts/AuthContext';

export function useLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkLoginStatus } = useAuth();




  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. 페이지 진입 시 백엔드의 /api/users/login-info 호출 및 redirectUrl 쿠키 저장
  useEffect(() => {
    const redirectUrl = searchParams.get('redirectUrl');
    if (redirectUrl && !redirectUrl.includes('/users/login')) {
      document.cookie = `redirectUrl=${encodeURIComponent(redirectUrl)}; path=/; max-age=300`;
    }

    fetchLoginInfo();
  }, [searchParams]);



  // 백엔드 컨트롤러(/login-info)와 연동하여 시큐리티 메시지 및 초기 폼 데이터 가져오기
  const fetchLoginInfo = async () => {
    try {
      const messageParam = searchParams.get('message') || '';
      const res = await Api.formRequest(`/api/view/users/login-info?message=${encodeURIComponent(messageParam)}`, null, 'GET');
      
      if (res && res.isAvailable && res.data) {
        // 서버에서 전달받은 메시지가 있다면 에러/안내 메시지로 세팅
        if (res.data.message) {
          setErrorMessage(res.data.message);
        }
        // 서버에서 내려준 기본 폼 구조가 있다면 반영 가능
        if (res.data.loginForm) {
          setFormData(prev => ({
            ...prev,
            rememberMe: res.data.loginForm.rememberMe || false
          }));
        }
      }
    } catch (error) {
      console.error("로그인 정보 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 폼 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 3. 로그인 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const { username, password, rememberMe } = formData;

    if (!username.trim() || !password.trim()) {
      setErrorMessage("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const result = await Api.postRequest("/api/users/login", {
        username: username.trim(),
        password: password.trim(),
        rememberMe
      });

      if (result && result.isAvailable) {
         
        // 로그인 성공 후 인증 상태 및 사용자 정보 갱신
        await checkLoginStatus();

        const redirectUrl = searchParams.get('redirectUrl');

        if (redirectUrl && !redirectUrl.includes('/users/login')) {
          document.cookie = `redirectUrl=${encodeURIComponent(redirectUrl)}; path=/; max-age=300`;
          window.location.href = decodeURIComponent(redirectUrl);
        } else {
          // 앞서 맞춘 중첩 라우터 구조에 따른 기본 이동 경로
          navigate("/service/items/list/1"); 
        }
      } else {
        setErrorMessage(result.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      setErrorMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  // Spring Boot 서버 주소
  const BACKEND_URL = 'http://localhost:8080';
  // 소셜 로그인 URL 설정
  const redirectParam = searchParams.get('redirectUrl');
  const googleLoginUrl =
  `${BACKEND_URL}/oauth2/authorization/google${redirectParam ? `?redirectUrl=${encodeURIComponent(redirectParam)}` : ''}`;

  const naverLoginUrl =
  `${BACKEND_URL}/oauth2/authorization/naver${redirectParam ? `?redirectUrl=${encodeURIComponent(redirectParam)}` : ''}`;  


  return {
    formData,
    errorMessage,
    BACKEND_URL,
    loading,
    handleChange,
    handleSubmit,
    googleLoginUrl,
    naverLoginUrl
  };
}