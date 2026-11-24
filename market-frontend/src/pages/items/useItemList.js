import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Api from '../../api/api';

  dayjs.extend(relativeTime);
  dayjs.locale('ko');

export function useItemList() {
 const { id: categoryId } = useParams();
 const { user: currentUser, isAuthenticated } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [itemsData, setItemsData] = useState({ content: [], totalPages: 1, number: 0, first: true, last: true });
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('전체');

  const searchType = searchParams.get('searchType') || 'title';
  const kw = searchParams.get('kw') || '';
  const status = searchParams.get('status') || 'ON_SALE';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '0', 10);

  const [keywordInput, setKeywordInput] = useState(kw);


  useEffect(() => {
    setKeywordInput(kw);
    fetchData();
  }, [categoryId, searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 쿼리 파라미터 조합
      const queryParams = new URLSearchParams({
        searchType,
        kw,
        status,
        sort,
        page
      });

      const listUrl = categoryId 
        ? `/api/view/items/list/${categoryId}?${queryParams.toString()}`
        : `/api/view/items/list?${queryParams.toString()}`;

      // 백엔드 컨트롤러가 items 뿐만 아니라 categories, categoryName 등을 한꺼번에 내려줌
      const itemsRes = await Api.formRequest(listUrl, null, 'GET');
      
     if (itemsRes) {
          const resData = itemsRes;

          setItemsData(resData.items || { content: [] });
          setCategories(resData.categories || []);
          setCategoryName(resData.categoryName || '전체');
      }
            
    } catch (error) {
      console.error("상품 목록 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  
  // 날짜를 상대 시간으로 변환해주는 헬퍼 함수
  const formatRelativeTime = (rawDate) => {
    if (!rawDate) return '-';
    let isoDate = rawDate.replace(' ', 'T');
    if (!isoDate.endsWith('Z') && !isoDate.includes('+')) {
      isoDate += '+09:00';
    }
    const relative = dayjs(isoDate).fromNow();
    return relative !== 'Invalid Date' ? relative : rawDate;
  };

  // 라우터 구조 규칙(/service/items/...)에 맞춘 이동 경로 설정
  const getBasePath = (targetCategoryId) => {
    return targetCategoryId ? `/service/items/list/${targetCategoryId}` : `/service/items/list`;
  };

 const handleCategoryChange = (e) => {
      const selectedId = e.target.value;
      const params = new URLSearchParams(searchParams);

      params.set('page', '0');

      navigate(`${getBasePath(selectedId)}?${params.toString()}`);
  };

  const handleSearchTypeChange = (e) => {
      const params = new URLSearchParams(searchParams);

      params.set('searchType', e.target.value);
      setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (keywordInput.trim()) {
      params.set('kw', keywordInput);
    } else {
      params.delete('kw');
    }
    params.set('page', '0');
    navigate(`${getBasePath(categoryId)}?${params.toString()}`);
  };

  const handleFilterChange = (newSort) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.set('page', '0');
    navigate(`${getBasePath(categoryId)}?${params.toString()}`);
  };

  const handlePageChange = (targetPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', targetPage);
    navigate(`${getBasePath(categoryId)}?${params.toString()}`);
  };

  const handleRestrictedWriteClick = () => {
    alert('경고 2회 누수로 인해 게시글 작성이 제한되었습니다.');
  };

  return {
    itemsData,
    categories,
    categoryId,
    categoryName,
    currentUser,
    searchType,
    kw,
    keywordInput,
    setKeywordInput,
    status,
    sort,
    loading,
    handleCategoryChange,
    handleSearchSubmit,
    handleFilterChange,
    handlePageChange,
    handleRestrictedWriteClick,
    formatRelativeTime,
    handleSearchTypeChange
  };
}