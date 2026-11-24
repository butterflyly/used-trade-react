import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from '../../../api/api';

export function useRegister() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 1. 입력 폼 상태 관리
  const [formData, setFormData] = useState({
    username: '',
    passwordInput: '',
    passwordConfirm: '',
    nickname: '',
    email: '',
    inputCode: ''
  });

  // 2. 프로필 이미지 및 프리뷰 상태
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/images/default-profile.png'); // 기본 이미지 경로

  // 3. 필드별 상태 메시지 및 성공 여부 관리
  const [fieldStatus, setFieldStatus] = useState({
    username: { message: '', success: false, readOnly: false },
    nickname: { message: '', success: false, readOnly: false },
    email: { message: '', success: false, readOnly: false },
    inputCode: { message: '', success: false, readOnly: false }
  });

  // 비밀번호 형식 및 일치 여부 상태
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isPasswordMatched, setIsPasswordMatched] = useState(false);

  // 최종 에러 컨테이너 목록
  const [errors, setErrors] = useState([]);

  // 상태 체크 플래그 (전역 변수 대체)
  const [validationFlags, setValidationFlags] = useState({
    duplicateChecked: false,
    duplicateNicknameChecked: false,
    duplicateEmailChecked: false,
    mailAuthNumberChecked: false
  });

  // 일반 입력 변경 핸들러 및 실시간 유효성 검사
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 실시간 초기화 로직 (입력값이 바뀔 때 중복확인 해제)
    if (name === 'username') {
      setValidationFlags(prev => ({ ...prev, duplicateChecked: false }));
    }
    if (name === 'nickname') {
      setValidationFlags(prev => ({ ...prev, duplicateNicknameChecked: false }));
    }
    if (name === 'email') {
      setValidationFlags(prev => ({ ...prev, duplicateEmailChecked: false, mailAuthNumberChecked: false }));
    }

    // 비밀번호 형식 실시간 검증
    if (name === 'passwordInput') {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*()+|=]).{8,16}$/;
      if (!regex.test(value)) {
        setPasswordError("비밀번호는 영문 + 숫자 포함 8 ~ 16글자 이어야 합니다.");
        setIsPasswordValid(false);
      } else {
        setPasswordError('');
        setIsPasswordValid(true);
      }
    }

    // 비밀번호 확인 실시간 일치 검증
    if (name === 'passwordConfirm' || name === 'passwordInput') {
      const targetPassword = name === 'passwordInput' ? value : formData.passwordInput;
      const targetConfirm = name === 'passwordConfirm' ? value : formData.passwordConfirm;

      if (targetPassword !== targetConfirm) {
        setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
        setIsPasswordMatched(false);
      } else {
        setPasswordConfirmError('');
        setIsPasswordMatched(true);
      }
    }
  };

  // 이미지 업로드 트리거 및 프리뷰
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. 필드 상태 업데이트 헬퍼
  const updateStatus = (field, success, message, readOnly = false) => {
    setFieldStatus(prev => ({
      ...prev,
      [field]: { message, success, readOnly }
    }));
  };

  // 아이디 중복 확인
  const checkDuplicateUsername = async () => {
    const username = formData.username.trim();
    if (!/^[a-zA-Z0-9]{6,15}$/.test(username)) {
      updateStatus('username', false, "아이디는 영문/숫자 6~15자리로 입력해주세요.");
      setValidationFlags(prev => ({ ...prev, duplicateChecked: false }));
      return;
    }

    try {
      await Api.postRequest("/api/users/register/check-duplicate-id", { username });
      updateStatus('username', true, "사용 가능한 아이디입니다.", true);
      setValidationFlags(prev => ({ ...prev, duplicateChecked: true }));
    } catch (error) {
      const msg = error.message.replace('Error: ', '');
      updateStatus('username', false, msg || "이미 사용 중인 아이디입니다.");
      setValidationFlags(prev => ({ ...prev, duplicateChecked: false }));
    }
  };

  // 닉네임 중복 확인
  const checkDuplicateNickname = async () => {
    const nickname = formData.nickname.trim();
    if (!/^[a-zA-Z0-9ㄱ-ㅣ가-힣]{2,10}$/.test(nickname)) {
      updateStatus('nickname', false, "닉네임은 2~10자리로 입력해주세요.");
      setValidationFlags(prev => ({ ...prev, duplicateNicknameChecked: false }));
      return;
    }

    try {
      await Api.postRequest("/api/users/register/check-duplicate-nickname", { nickname });
      updateStatus('nickname', true, "사용 가능한 닉네임입니다.", true);
      setValidationFlags(prev => ({ ...prev, duplicateNicknameChecked: true }));
    } catch (error) {
      const msg = error.message.replace('Error: ', '');
      updateStatus('nickname', false, msg || "이미 사용 중인 닉네임입니다.");
      setValidationFlags(prev => ({ ...prev, duplicateNicknameChecked: false }));
    }
  };

  // 이메일 인증번호 전송
  const sendEmailAuth = async () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const email = formData.email.trim();

    if (!emailRegex.test(email)) {
      updateStatus('email', false, "이메일 형식을 확인해주세요.");
      setValidationFlags(prev => ({ ...prev, duplicateEmailChecked: false }));
      return;
    }

    try {
      await Api.postRequest("/api/users/register/mail-auth", { email });
      updateStatus('email', true, "인증번호가 전송되었습니다.", true);
      setValidationFlags(prev => ({ ...prev, duplicateEmailChecked: true }));
    } catch (error) {
      const msg = error.message.replace('Error: ', '');
      updateStatus('email', false, msg || "이미 요청했거나 잠시 후 다시 시도해주세요.");
      setValidationFlags(prev => ({ ...prev, duplicateEmailChecked: false }));
    }
  };

  // 인증번호 확인
  const verifyEmailCode = async () => {
    const inputCode = formData.inputCode.trim();
    const email = formData.email.trim();

    if (!/^\d{6}$/.test(inputCode)) {
      updateStatus('inputCode', false, "인증번호 6자리를 입력해주세요.");
      setValidationFlags(prev => ({ ...prev, mailAuthNumberChecked: false }));
      return;
    }

    try {
      await Api.postRequest("/api/users/register/mail-verify", { email, code: inputCode });
      updateStatus('inputCode', true, "인증되었습니다.", true);
      setValidationFlags(prev => ({ ...prev, mailAuthNumberChecked: true }));
    } catch (error) {
      const msg = error.message.replace('Error: ', '');
      updateStatus('inputCode', false, msg || "인증번호가 일치하지 않습니다.");
      setValidationFlags(prev => ({ ...prev, mailAuthNumberChecked: false }));
    }
  };

  // 변경 버튼 함수들 (수정 가능 상태로 되돌리기)
  const changeUsername = () => {
    updateStatus('username', false, '', false);
    setValidationFlags(prev => ({ ...prev, duplicateChecked: false }));
  };

  const changeNickname = () => {
    updateStatus('nickname', false, '', false);
    setValidationFlags(prev => ({ ...prev, duplicateNicknameChecked: false }));
  };

  const changeEmail = () => {
    updateStatus('email', false, '', false);
    updateStatus('inputCode', false, '', false);
    setFormData(prev => ({ ...prev, inputCode: '' }));
    setValidationFlags(prev => ({ ...prev, duplicateEmailChecked: false, mailAuthNumberChecked: false }));
  };

  // 최종 가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = [];

    if (!validationFlags.duplicateChecked) formErrors.push("아이디 중복 확인을 완료해 주세요.");
    if (!isPasswordValid) formErrors.push("비밀번호 양식을 지켜주세요.");
    if (!isPasswordMatched) formErrors.push("비밀번호가 서로 일치하지 않습니다.");
    if (!validationFlags.duplicateNicknameChecked) formErrors.push("닉네임 중복 확인을 완료해 주세요.");
    if (!validationFlags.duplicateEmailChecked) formErrors.push("이메일 인증번호를 먼저 전송해 주세요.");
    if (!validationFlags.mailAuthNumberChecked) formErrors.push("이메일 인증번호 확인이 완료되지 않았습니다.");

    if (formErrors.length > 0) {
      setErrors(formErrors);
      window.scrollTo(0, 0);
      return;
    }

    const data = new FormData();
    data.append('username', formData.username);
    data.append('password', formData.passwordInput);
    data.append('password2', formData.passwordConfirm);
    data.append('nickname', formData.nickname);
    data.append('email', formData.email);
    data.append('inputCode', formData.inputCode);

    if (profileFile) {
      data.append('profileImage', profileFile);
    }

    try {
      const result = await Api.formRequest("/api/users/register", data);
      if (result && result.isAvailable) {
        alert("회원가입을 축하합니다!");
        navigate("/service/users/auth/login");
      }
    } catch (error) {
      setErrors([error.message.replace('Error: ', '')]);
      window.scrollTo(0, 0);
    }
  };

  return {
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
  };
}