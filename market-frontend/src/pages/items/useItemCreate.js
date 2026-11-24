import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // useSearchParams 추가
import Api from '../../api/api';
import { useAuth } from "../../contexts/AuthContext";


export function useItemCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // URL 쿼리 파라미터 읽기용
  const {
  isAuthenticated,
  isAuthLoading
} = useAuth();

  // 1. URL 쿼리 파라미터(?categoryId=...)에서 초기값 추출
  const initialCategoryId = searchParams.get('categoryId') || '';

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    price: 0,
    categoryId: initialCategoryId // 초기 진입 시 쿼리 파라미터 값 반영
  });

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState([]);

   // 백엔드의 /create-form 컨트롤러와 대응되는 메타데이터 로조 (카테고리 목록 등)
  const fetchCreateFormMetaData = async () => {
    try {
      // 쿼리 파라미터가 있다면 백엔드에도 전달해서 필요한 초기 처리를 맞출 수 있습니다.
      const queryStr = initialCategoryId ? `?categoryId=${initialCategoryId}` : '';
      const res = await Api.formRequest(`/api/view/items/create-form${queryStr}`, null, 'GET');
      
      if (res) {

        // 백엔드 Map 응답 구조(categories 등)에 맞춰 안전하게 추출
        setCategories(res.categories || []);
        
        if (res.selectedCategoryId) {
          setFormData(prev => ({ ...prev, categoryId: res.selectedCategoryId }));
        }
      }
    } catch (error) {
      console.error("상품 등록 폼 데이터를 불러오지 못했습니다.", error);
    }
  };

 useEffect(() => {
  if (isAuthLoading) return;

  if (!isAuthenticated) {
      navigate("/service/users/auth/login");
      return;
    }

    fetchCreateFormMetaData();
  }, [isAuthLoading, isAuthenticated]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // 1. 클라이언트 사이드 검증
    let clientErrors = [];
    if (!formData.title.trim()) clientErrors.push("제목은 필수 입력입니다.");
    else if (formData.title.length < 2) clientErrors.push("제목은 최소 2글자 이상이어야 합니다.");
    if (!formData.content.trim()) clientErrors.push("내용을 입력해주세요.");
    if (isNaN(formData.price) || formData.price < 0) clientErrors.push("가격은 0원 이상 숫자로 입력해주세요.");
    if (!formData.categoryId) clientErrors.push("카테고리를 선택해주세요.");
    if (images.length > 5) clientErrors.push("이미지는 최대 5장까지 가능합니다.");

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      window.scrollTo(0, 0);
      return;
    }

    // 2. FormData 생성 및 전송
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('price', formData.price);
    data.append('categoryId', formData.categoryId);

    for (let i = 0; i < images.length; i++) {
      data.append('images', images[i]);
    }

    try {
      const result = await Api.formRequest("/api/items/create", data, 'POST'); // 메서드 명시 필요시 조정
      if (result && result.isAvailable) {
        alert(result.message);
        navigate(`/service/items/list/${formData.categoryId}`); // 앞서 맞춘 라우터 구조에 맞게 수정
      }
    } catch (error) {
      if (error.message && error.message.includes("로그인")) {
        alert(error.message);
        navigate("/service/users/auth/login"); // 라우터 구조에 맞춘 로그인 경로
        return;
      }
      setErrors(error.message ? error.message.split("\n") : ["등록 중 오류가 발생했습니다."]);
      window.scrollTo(0, 0);
    }
  };

  return {
    formData,
    categories,
    errors,
    handleChange,
    handleFileChange,
    handleSubmit
  };
}