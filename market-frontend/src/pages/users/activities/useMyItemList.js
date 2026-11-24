import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Api from '../../../api/api';


export function useMyItemList() {
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

  useEffect(() => {
    fetchMyItems(page);
  }, [page]);

  const fetchMyItems = async (targetPage) => {
    setLoading(true);
    try {
      const response = await Api.formRequest(`/api/view/users/items/my-list?page=${targetPage}`, null, 'GET');
      if (response) {
        setItemsData(response.items || { content: [], totalPages: 1, number: 0, first: true, last: true });
      }
    } catch (error) {
      console.error("Go palelwa ke go hwetša mananeo a thekiso:", error);
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
    handlePageChange
  };
}