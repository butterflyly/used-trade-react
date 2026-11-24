import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Api from '../../../api/api';

export function useMyChats() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRole = searchParams.get('role') || 'BUYER';
  const page = parseInt(searchParams.get('page') || '0', 10);

  const [loading, setLoading] = useState(true);
  const [chatsData, setChatsData] = useState({
    content: [],
    totalPages: 1,
    number: 0,
    first: true,
    last: true
  });

  useEffect(() => {
    fetchChats(currentRole, page);
  }, [currentRole, page]);

  const fetchChats = async (role, targetPage) => {
    setLoading(true);

    try {
      const response = await Api.formRequest(
        `/api/view/users/mypage/chats?role=${role}&page=${targetPage}`,
        null,
        'GET'
      );

      if (response) {
        setChatsData(response);
      }
    } catch (error) {
      console.error("채팅 목록을 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    const params = new URLSearchParams(searchParams);
    params.set('role', newRole);
    params.set('page', '0'); // Bušetša go page ya mathomo ge role e fetoga
    setSearchParams(params);
  };

  const handlePageChange = (targetPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', targetPage);
    setSearchParams(params);
  };

  return {
    loading,
    chatsData,
    currentRole,
    handleRoleChange,
    handlePageChange
  };
}