import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Api from '../../../api/api';

export function useMyLikeList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0', 10);

  const [loading, setLoading] = useState(true);
  const [itemsData, setItemsData] = useState({
    content: [],
    totalPages: 1,
    number: 0,
    first: true,
    last: true
  });
  const [pageTitle, setPageTitle] = useState('내 찜 목록');

  useEffect(() => {
    fetchMyLikes(page);
  }, [page]);

  const fetchMyLikes = async (targetPage) => {
    setLoading(true);
    try {
      const response = await Api.formRequest(`/api/view/users/items/my-like-list?page=${targetPage}`, null, 'GET');
      if (response) {
        setItemsData(response);
        if (response.pageTitle) {
          setPageTitle(response.pageTitle);
        }
      }
    } catch (error) {
      console.error("Go palelwa ke go hwetša dithoto tše di ratwago:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (targetPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', targetPage);
    setSearchParams(params);
  };

  return {
    loading,
    itemsData,
    pageTitle,
    handlePageChange
  };
}