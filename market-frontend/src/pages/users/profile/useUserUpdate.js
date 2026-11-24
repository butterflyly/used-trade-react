import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from '../../../api/api';

export function useUserUpdate() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [previewUrl, setPreviewUrl] = useState(
    'http://localhost:8080/images/default-profile.png'
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState([]);

  // 기존 유저 정보 불러오기
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // 사용자 현재 정보 조회 API (경로는 백엔드 명칭에 맞게 조정 가능)
      const response = await Api.formRequest('/api/view/users/update', null, 'GET');
      if (response) {
        const user = response;
        if (user.nickname) setNickname(user.nickname);
        if (user.profileUrl) {
          setPreviewUrl(`http://localhost:8080${user.profileUrl}`);
        }
      }
    } catch (error) {
      console.error("유저 정보를 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  // 이미지 미리보기 로직 (Blob URL 활용 및 메모리 누수 방지)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      const blobUrl = URL.createObjectURL(file);
      setPreviewUrl(blobUrl);
    }
  };

  // 폼 제출 및 수정 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const trimmedNickname = nickname.trim();
    const clientErrors = [];

    if (!trimmedNickname) {
      clientErrors.push("닉네임을 입력해주세요.");
    } else if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      clientErrors.push("닉네임은 2자 이상 10자 이하로 입력해주세요.");
    }

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      window.scrollTo(0, 0);
      return;
    }

    const formData = new FormData();
    formData.append('nickname', trimmedNickname);

    if (selectedFile) {
      formData.append('profileImage', selectedFile);
    }

    try {
      const result = await Api.formRequest("/api/users/update", formData, 'PUT');

      if (result && result.isAvailable) {
        alert(result.message || "프로필이 수정되었습니다.");
        navigate("/service/users/profile/mypage");
      } else {
        setErrors([result.message || "수정에 실패했습니다."]);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      setErrors(error.message ? error.message.split("\n") : ["서버 오류가 발생했습니다."]);
      window.scrollTo(0, 0);
    }
  };

  return {
    loading,
    nickname,
    setNickname,
    previewUrl,
    errors,
    handleFileChange,
    handleSubmit
  };
}