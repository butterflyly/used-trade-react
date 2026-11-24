import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Api from '../../../api/api';

export function useMyBuyItems() {
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
  const [pageTitle, setPageTitle] = useState('내 구매 내역');

  useEffect(() => {
    fetchBuyItems(page);
  }, [page]);

  const fetchBuyItems = async (targetPage) => {
    setLoading(true);
    try {
      // Fetši histori ya reko go tšwa go API ya gago
      const response = await Api.formRequest(`/api/view/users/items/my-buy-list?page=${targetPage}`, null, 'GET');
      if (response ) {
        setItemsData(response.items || { content: [], totalPages: 1, number: 0, first: true, last: true });
        if (response.data.pageTitle) {
          setPageTitle(response.data.pageTitle);
        }
      }
    } catch (error) {
      console.error("Go palelwa ke go hwetša dintlha tša reko:", error);
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