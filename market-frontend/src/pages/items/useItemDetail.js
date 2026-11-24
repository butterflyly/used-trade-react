
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Api from '../../api/api';
import { useAuth } from "../../contexts/AuthContext";

export function useItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatBuyers, setChatBuyers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');

  const { user, isAuthenticated } = useAuth();

  // 신고 모달 입력 상태
  const [reportType, setReportType] = useState('');
  const [reportContent, setReportContent] = useState('');

  // 1. 상세 데이터 불러오기
  const fetchItemDetail = async () => {
    try {
      setLoading(true);

      const response = await Api.formRequest(
        `/api/view/items/detail/${itemId}`,
        null,
        "GET"
      );

      setItem(response);
      setSelectedStatus(response.itemStatus);

    } catch (error) {
      console.error("상품 상세 정보 조회 실패:", error);

      if (error.status) {
        navigate(`/service/error/${error.status}`);
        return;
      }

      alert(error.message || "상품 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemDetail();
  }, [itemId]);

  // 2. 삭제하기
  const handleDelete = async () => {
    if (!window.confirm(
      "정말로 이 게시글을 삭제하시겠습니까?\n삭제 후에는 복원할 수 없습니다."
    )) return;

    try {
      const result = await Api.postRequest(
        `/api/items/delete/${itemId}`,
        {},
        "DELETE"
      );

      if (result && result.isAvailable) {
        alert(result.message || "성공적으로 삭제되었습니다.");
        navigate(`/service/items/list/${item.categoryId}`);
      }
    } catch (error) {
      alert(error.message || "삭제 처리 중 오류가 발생했습니다.");
    }
  };

  // 3. 채팅방 생성하기
  const handleCreateChat = async () => {
    try {
      const result = await Api.postRequest(
        `/api/chat-room/create?itemId=${itemId}`
      );

      if (result.isAvailable) {
        alert(result.message);
        navigate(`/service/chat/room/${result.data}`);
      }
    } catch (error) {
      alert(error.message || "채팅방을 생성할 수 없습니다.");
    }
  };

  // 4. 찜(좋아요) 토글
  const handleToggleLike = async () => {
    try {
      const result = await Api.postRequest(`/api/items/vote/${itemId}`);

      if (result && result.isAvailable) {
        setItem(prev => ({
          ...prev,
          isLiked: !prev.isLiked,
          likeCount: prev.isLiked
            ? Math.max(0, prev.likeCount - 1)
            : prev.likeCount + 1
        }));
      }
    } catch (error) {
      alert(error.message || "로그인이 필요하거나 찜을 처리할 수 없습니다.");
    }
  };

  // 5. 판매 상태 변경 요청
  const requestUpdateStatus = async (targetStatus, buyerUsername) => {
    try {
      const bodyData = {
        itemStatus: targetStatus,
        buyerUsername: buyerUsername
      };

      const response = await Api.postRequest(
        `/api/items/status/${itemId}`,
        bodyData,
        "PATCH"
      );

      if (response.isAvailable) {
        alert(response.message || "상태가 성공적으로 변경되었습니다.");

        setSelectedStatus(targetStatus);
        setItem(prev => ({
          ...prev,
          itemStatus: targetStatus
        }));

        return true;
      } else {
        alert(response.message || "변경에 실패했습니다.");
        return false;
      }
    } catch (error) {
      alert(error.message || "요청 처리 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 구매자 선택 모달 닫기
  const handleCloseBuyerModal = () => {
    setShowBuyerModal(false);
    setChatBuyers([]);
    setPendingStatus('');

    // 셀렉트박스를 실제 상품 상태로 복구
    setSelectedStatus(item.itemStatus);
  };

  // 모달에서 구매자 선택
  const handleSelectBuyer = async (buyer) => {
    const statusText =
      pendingStatus === "RESERVED" ? "예약" : "거래 완료";

    if (!window.confirm(
      `${buyer.displayNickname}님과 ${statusText}하시겠습니까?`
    )) {
      return;
    }

    const success = await requestUpdateStatus(
      pendingStatus,
      buyer.username
    );

    // 성공/실패 여부와 관계없이 모달 종료
    if (!success) {
      setSelectedStatus(item.itemStatus);
    }

    setShowBuyerModal(false);
    setChatBuyers([]);
    setPendingStatus('');
  };

  // 6. 상태 변경 셀렉트박스 핸들러
  const handleStatusChange = async (e) => {
    const currentStatus = e.target.value;

    const isReservedAction = currentStatus === "RESERVED";
    const statusText = isReservedAction ? "예약" : "거래 완료";
    const infoText = isReservedAction
      ? "확인 시 해당 유저와 예약 상태로 변경됩니다."
      : "확인 시 변경 후 되돌릴 수 없습니다.";

    const isCurrentlyReserved = item.itemStatus === "RESERVED";

    // 예약중인 상품을 판매완료로 변경하는 경우
    // 기존 예약자와 바로 거래 완료 처리
    if (isCurrentlyReserved && currentStatus === "SOLD_OUT") {
      if (window.confirm(
        "기존 예약자분과 거래를 완료하시겠습니까?\n확인 시 바로 판매완료 처리됩니다."
      )) {
        await requestUpdateStatus(currentStatus, null);
      } else {
        setSelectedStatus(item.itemStatus);
      }

      return;
    }

    // 예약 또는 판매완료 상태로 변경하는 경우
    if (currentStatus === "SOLD_OUT" || currentStatus === "RESERVED") {
      try {
        const response = await Api.postRequest(
          `/api/items/${itemId}/chat-buyers`,
          null,
          "GET"
        );

        if (!response.isAvailable) {
          alert(response.message || "구매자 목록을 불러오지 못했습니다.");
          setSelectedStatus(item.itemStatus);
          return;
        }

        const buyers = response.data;

        if (!buyers || buyers.length === 0) {
          alert("이 상품으로 대화한 구매자가 없어 상태를 변경할 수 없습니다.");
          setSelectedStatus(item.itemStatus);
          return;
        }

        // 구매자가 1명인 경우
        if (buyers.length === 1) {
          const buyer = buyers[0];

          if (window.confirm(
            `'${buyer.displayNickname}'님과 ${statusText}하시겠습니까?\n${infoText}`
          )) {
            await requestUpdateStatus(currentStatus, buyer.username);
          } else {
            setSelectedStatus(item.itemStatus);
          }

          return;
        }

        // 구매자가 여러 명인 경우 모달 표시
        setChatBuyers(buyers);
        setPendingStatus(currentStatus);
        setShowBuyerModal(true);

      } catch (error) {
        alert("서버 통신 중 오류가 발생했습니다.");
        setSelectedStatus(item.itemStatus);
      }

      return;
    }

    // 판매중 등 그 외 상태 변경
    if (window.confirm("상품 상태를 변경하시겠습니까?")) {
      await requestUpdateStatus(currentStatus, null);
    } else {
      setSelectedStatus(item.itemStatus);
    }
  };

  // 7. 신고하기 제출
  const handleReportSubmit = async (e, closeModalCallback) => {
    e.preventDefault();

    if (!window.confirm("정말로 이 게시글을 신고하시겠습니까?")) return;

    try {
      const result = await Api.postRequest(
        `/api/reports/item/${itemId}`,
        {
          reportType,
          content: reportContent
        }
      );

      if (result && result.isAvailable) {
        alert("신고가 정상적으로 접수되었습니다.");
        setReportType('');
        setReportContent('');
        closeModalCallback();
      } else {
        alert(result.message || "신고 처리 중 에러가 발생했습니다.");
      }
    } catch (error) {
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  // 8. 작성자 경고
  const handleWarnSeller = async () => {
    if (!window.confirm(
      '해당 게시글 작성자에게 경고 1회를 부여하고 게시글을 즉시 숨기시겠습니까?'
    )) {
      return;
    }

    try {
      const result = await Api.postRequest(
        `/api/admin/items/${itemId}/warn-seller`,
        null,
        'POST'
      );

      if (result?.isAvailable) {
        alert(result.message);
        navigate(`/service/items/list/${item.categoryId}`);
      }
    } catch (error) {
      alert(error.message || '작성자 경고 처리 중 오류가 발생했습니다.');
    }
  };

  // 9. 작성자 영구 정지
  const handleBlackSeller = async () => {
    if (!window.confirm(
      '정말 해당 작성자를 영구 정지(블랙) 처리하시겠습니까?\n게시글도 즉시 숨김 처리됩니다.'
    )) {
      return;
    }

    try {
      const result = await Api.postRequest(
        `/api/admin/items/${itemId}/black-seller`,
        null,
        'POST'
      );

      if (result?.isAvailable) {
        alert(result.message);
        navigate(`/service/items/list/${item.categoryId}`);
      }
    } catch (error) {
      alert(error.message || '작성자 블랙 처리 중 오류가 발생했습니다.');
    }
  };

  return {
    id: itemId,
    item,
    loading,
    user,
    isAuthenticated,

    selectedStatus,
    chatBuyers,
    showBuyerModal,
    pendingStatus,

    reportType,
    reportContent,
    setReportType,
    setReportContent,

    handleDelete,
    handleCreateChat,
    handleToggleLike,
    handleStatusChange,
    requestUpdateStatus,
    handleCloseBuyerModal,
    handleSelectBuyer,
    handleReportSubmit,
    handleWarnSeller,
    handleBlackSeller
  };
}
