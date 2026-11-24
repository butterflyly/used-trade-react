import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Api from '../../api/api';
import { useAuth } from "../../contexts/AuthContext";


export function useItemEdit() {
  const { itemId } = useParams(); // URL 파라미터에서 상품 ID 추출
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState([]);
   const {
    isAuthenticated,
    isAuthLoading
  } = useAuth();

  // 수정 폼 입력 데이터 상태
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    price: 0,
    categoryId: ''
  });

  // 새로 추가할 이미지 파일 목록 상태
  const [newImages, setNewImages] = useState([]);

  // 기존 등록된 이미지 리스트 및 삭제할 이미지 ID 목록 상태
  const [existingImages, setExistingImages] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);

  // 1. 마운트 시 상품 상세 정보 및 카테고리 목록 불러오기
  useEffect(() => {
     if (isAuthLoading) return;

    if (!isAuthenticated) {
        navigate("/service/users/auth/login");
        return;
      }
      
    fetchItemAndCategories();
  }, [itemId, isAuthLoading, isAuthenticated]);

 const fetchItemAndCategories = async () => {
    try {
      // 백엔드의 editForm 컨트롤러 경로에 맞게 호출
      const res = await Api.formRequest(`/api/view/items/edit/${itemId}`, null, "GET");

      if (res) {
        const { item, categories: catList } = res; // 백엔드가 묶어준 responseData 구조 분해

        // 1. 상품 정보 폼 세팅
        setFormData({
            title: item.title || '',
            content: item.content || '',
            price: item.price || 0,
            categoryId: item.categoryId || ''
        });
        
        // 2. 기존 이미지 리스트 세팅
        setExistingImages(item.itemImageList || []);

        // 3. 카테고리 목록 세팅
        setCategories(catList || []);
      }
    } catch (error) {
      console.error("수정 폼 데이터를 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 텍스트 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. 새 이미지 파일 선택 핸들러
  const handleFileChange = (e) => {
    setNewImages(e.target.files);
  };

  // 4. 기존 이미지 삭제 카드 클릭 핸들러 (화면에서 숨기고 삭제 목록에 ID 추가)
  const handleRemoveExistingImage = (imageId) => {
    if (window.confirm("이 이미지를 삭제하시겠습니까?")) {
      setDeleteImageIds(prev => [...prev, imageId]);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  // 5. 폼 제출 핸들러 (수정 완료)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // 클라이언트 사이드 검증
    let clientErrors = [];
    if (!formData.title.trim()) clientErrors.push("제목은 필수 입력입니다.");
    else if (formData.title.length < 2) clientErrors.push("제목은 최소 2글자 이상이어야 합니다.");
    if (!formData.content.trim()) clientErrors.push("내용을 입력해주세요.");
    const parsedPrice = parseInt(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) clientErrors.push("가격은 0원 이상 숫자로 입력해주세요.");
    if (!formData.categoryId) clientErrors.push("카테고리를 선택해주세요.");

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      window.scrollTo(0, 0);
      return;
    }

    // FormData 생성
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('price', parsedPrice);
    data.append('categoryId', formData.categoryId);

    // 새 이미지 파일 추가
    if (newImages && newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        data.append('images', newImages[i]);
      }
    }

    // 삭제할 기존 이미지 ID들 추가
    deleteImageIds.forEach(id => {
      data.append('deleteImageIds', id);
    });

    try {
      const result = await Api.formRequest(`/api/items/update/${itemId}`, data, 'PUT');
      if (result && (result.success || result.isAvailable)) {
        alert(result.message || "상품이 수정되었습니다.");
        navigate(`/service/items/detail/${itemId}`);
      }
    } catch (error) {
      if (error.message.includes("로그인")) {
        alert(error.message);
        navigate("/users/login");
        return;
      }
      setErrors(error.message.split("\n"));
      window.scrollTo(0, 0);
    }
  };

  return {
    itemId,
    formData,
    categories,
    existingImages,
    errors,
    loading,
    handleChange,
    handleFileChange,
    handleRemoveExistingImage,
    handleSubmit
  };
}