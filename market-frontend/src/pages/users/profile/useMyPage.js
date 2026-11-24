import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Api from '../../../api/api';

export function useMyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [myPageData, setMyPageData] = useState({
    userInfo: { nickname: '', email: '', createdAt: '', profileUrl: '', providers: '' },
    sellingPosts: { content: [], totalElements: 0 },
    boughtPosts: { content: [], totalElements: 0 },
    likedPosts: { content: [], totalElements: 0 },
    buyChatRooms: { content: [], totalElements: 0 },
    sellChatRooms: { content: [], totalElements: 0 },
    writtenReviews: { content: [], totalElements: 0 },
    receivedReviews: { content: [], totalElements: 0 }
  });

  // 리뷰 작성 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalItemId, setModalItemId] = useState('');
  const [modalItemTitle, setModalItemTitle] = useState('구매 상품');
  const [modalRating, setModalRating] = useState('5');
  const [modalContent, setModalContent] = useState('');

  // 1. 마이페이지 데이터 불러오기 및 URL 파라미터 감지 (모달 자동 오픈)
  useEffect(() => {
    fetchMyPageData();
  }, []);

  const fetchMyPageData = async () => {
    setLoading(true);
    try {
      const response = await Api.formRequest('/api/view/users/mypage', null, 'GET');
      if (response) {
        setMyPageData(response);

          console.log("전체 마이페이지 응답:", response);
          console.log("userInfo:", response.userInfo);
          console.log("profileUrl:", response.userInfo?.profileUrl);

        // 데이터 로드 후 URL 파라미터 체크 (reviewModal=true & itemId=XX)
        const isReviewModal = searchParams.get('reviewModal');
        const itemId = searchParams.get('itemId');

        if (isReviewModal === 'true' && itemId) {
          // 구매 내역 탭 혹은 모달 오픈 처리
          openReviewModal(itemId, "거래 상품");
        }
      }
    } catch (error) {
      console.error("마이페이지 데이터를 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  // 리뷰 모달 오픈 공통 함수
  const openReviewModal = (itemId, itemTitle) => {
    setModalItemId(itemId);
    setModalItemTitle(itemTitle || "구매 상품");
    setModalContent('');
    setModalRating('5');
    setIsModalOpen(true);
  };

  // 리뷰 모달 닫기
  const closeReviewModal = () => {
    setIsModalOpen(false);
    // URL에 남아있는 쿼리스트링 정리
    if (searchParams.has('reviewModal')) {
      searchParams.delete('reviewModal');
      searchParams.delete('itemId');
      setSearchParams(searchParams);
    }
  };

  // 리뷰 등록 제출 핸들러
  const handleReviewSubmit = async () => {
    const trimmedContent = modalContent.trim();
    if (!trimmedContent) {
      alert("후기 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await Api.postRequest(`/api/reviews/item/${modalItemId}`, {
        rating: parseInt(modalRating),
        content: trimmedContent
      });

      if (response && response.isAvailable) {
        alert(response.message || "거래 후기가 성공적으로 등록되었습니다!");
        closeReviewModal();
        fetchMyPageData(); // 목록 새로고침
      } else {
        alert(response?.message || "후기 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("리뷰 등록 중 에러:", error);
      alert("서버와의 통신 오류가 발생했습니다.");
    }
  };

  // 내가 쓴 후기 삭제 핸들러
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("이 후기를 정말로 삭제하시겠습니까?")) return;

    try {
      // fetch 혹은 Api.postRequest 활용
      const res = await fetch(`/reviews/${reviewId}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success || data.isAvailable || data === true) {
        alert("후기가 정상적으로 삭제되었습니다.");
        fetchMyPageData();
      } else {
        alert(data.message || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류로 인해 삭제에 실패했습니다.");
    }
  };

  // 회원 탈퇴 핸들러 (일반 유저 vs 소셜 유저 분기)
  const handleWithdrawClick = async (isSocial) => {
    if (isSocial) {
      if (!window.confirm("소셜 연동 회원입니다. 정말로 탈퇴하시겠습니까?\n탈퇴 시 소셜 계정 연동이 자동으로 해제됩니다.")) {
        return;
      }

      try {
        const result = await Api.postRequest("/api/users/delete", { password: "SOCIAL_USER_WITHDRAW" }, "DELETE");
        if (result && result.isAvailable) {
          alert("그동안 이용해주셔서 감사합니다. 회원 탈퇴가 완료되었습니다.");
          navigate("/");
        } else {
          alert(result.message || "탈퇴 처리 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("소셜 탈퇴 통신 실패:", error);
        alert(error.message || "통신 실패");
      }
    } else {
      navigate('/service/users/profile/withdraw');
    }
  };

  return {
    loading,
    myPageData,
    isModalOpen,
    modalItemTitle,
    modalRating,
    setModalRating,
    modalContent,
    setModalContent,
    openReviewModal,
    closeReviewModal,
    handleReviewSubmit,
    handleDeleteReview,
    handleWithdrawClick,
    reloadPage: fetchMyPageData
  };
}