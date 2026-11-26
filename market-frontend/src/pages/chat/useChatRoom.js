import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import Api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';

dayjs.locale('ko');

export function useChatRoom(roomIdProp) {
  // 1. 라우터 정보
  const params = useParams();
  const roomId = roomIdProp ?? params.roomId;
  const navigate = useNavigate();

  // 2. 채팅방 상태
  const [roomInfo, setRoomInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // 3. 로그인 정보 (AuthContext에서 가져옴)
  const {
    user,
    isAuthenticated,
    isAuthLoading
  } = useAuth();

  const currentLoginNickname = user?.nickname;

  // 4. Ref
  const stompClientRef = useRef(null);
  const messageAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  // 5. 메시지의 isMine을 현재 로그인 사용자 기준으로 계산
  const normalizeMessage = (message) => {
    return {
      ...message,
      isMine: message.senderNickname === currentLoginNickname
    };
  };

  // 6. 기존 채팅방 정보 및 메시지 불러오기 (REST)
  const fetchChatRoomData = async () => {
    try {
      const res = await Api.formRequest(
        `/api/view/chat-room/${roomId}`,
        null,
        'GET'
      );

      if (res) {
        setRoomInfo({
          roomId: res.roomId,
          itemTitle: res.itemTitle,
          itemImageUrl: res.itemImageUrl,
          itemId: res.itemId,
          partnerNickname: res.partnerNickname
        });

        // 기존 메시지도 현재 로그인 사용자 기준으로 isMine 계산
        setMessages(
          (res.messages || []).map(normalizeMessage)
        );
      }
    } catch (error) {
      console.error('채팅방 정보를 불러오지 못했습니다.', error);
    } finally {
      setLoading(false);
    }
  };

  // 7. 웹소켓 및 STOMP 초기화
  const initWebSocket = () => {
    const client = new Client({
      webSocketFactory: () => {
        return new SockJS('http://localhost:8080/ws-stomp');
      },

      reconnectDelay: 5000,

      debug: (str) => {
        console.log('STOMP Log:', str);
      },

      // 서버 연결 성공
      onConnect: () => {
        console.log('웹소켓 연결 성공!');

        // 채팅방 구독
        client.subscribe(
          `/sub/chat/room/${roomId}`,
          (chatMessage) => {
            const msgBody = JSON.parse(chatMessage.body);

            // 1. READ 메시지 처리
            if (msgBody.type === 'READ') {
              setMessages((prevMessages) =>
                prevMessages.map((msg) => ({
                  ...msg,
                  isRead: true
                }))
              );

              return;
            }

            // 2. 일반 메시지 처리
            const normalizedMessage = normalizeMessage(msgBody);

            setMessages((prevMessages) => [
              ...prevMessages,
              normalizedMessage
            ]);

            // 3. 상대방 메시지를 받은 경우 읽음 신호 전송
            if (
              !normalizedMessage.isMine &&
              normalizedMessage.type !== 'NOTICE'
            ) {
              console.log('[READ 신호 전송]');

              stompClientRef.current?.publish({
                destination: '/pub/chat/read',
                body: JSON.stringify({
                  roomId: roomId
                })
              });
            }
          }
        );
      },

      // STOMP 오류
      onStompError: (frame) => {
        console.error('웹소켓 브로커 에러:', frame);
      },

      // 웹소켓 연결 종료
      onWebSocketClose: () => {
        console.log('웹소켓 연결 종료');
      }
    });

    client.activate();

    stompClientRef.current = client;
  };

  // 8. 로그인 확인 후 채팅방 데이터 및 웹소켓 초기화
  useEffect(() => {
   
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      navigate('/service/users/auth/login');
      return;
    }

   if (!roomId || !currentLoginNickname) return;
    setLoading(true);

    fetchChatRoomData();
    initWebSocket();

    // 컴포넌트 종료 또는 방 변경 시 웹소켓 종료
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [
    isAuthLoading,
    isAuthenticated,
    currentLoginNickname,
    roomId
  ]);

  // 9. 파일 선택
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // 파일 크기 검사 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하만 가능합니다.');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    // 이전 미리보기 URL 정리
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);

    // 이미지 미리보기 URL 생성
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 10. 이미지 선택 취소
  const clearSelectedImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 11. STOMP 메시지 전송
  const sendStompMessage = (content, type) => {
    const client = stompClientRef.current;

    if (!client || !client.connected) {
      alert('웹소켓 연결이 끊어져 있습니다.');
      return false;
    }

    const messagePayload = {
      roomId: roomId,
      content: content,
      type: type
    };

    try {
      client.publish({
        destination: '/pub/chat/message',
        body: JSON.stringify(messagePayload)
      });

      return true;
    } catch (error) {
      console.error('메시지 publish 에러:', error);
      return false;
    }
  };

  // 12. 메시지 전송 버튼
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !stompClientRef.current ||
      !stompClientRef.current.connected
    ) {
      alert('채팅 서버 연결 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      const contentToSend = inputText.trim();

      // 이미지 전송
      if (selectedFile) {
        const formData = new FormData();

        formData.append('image', selectedFile);

        const imgRes = await Api.formRequest(
          '/api/chat/image',
          formData
        );

        if (imgRes && imgRes.isAvailable) {
          console.log('이미지 업로드 응답:', imgRes.data);

          const success = sendStompMessage(
            imgRes.data,
            'IMAGE'
          );

          if (success) {
            clearSelectedImage();
          }
        } else {
          alert('이미지 업로드 실패');
          return;
        }
      }

      // 텍스트 전송
      if (contentToSend) {
        const success = sendStompMessage(
          contentToSend,
          'TALK'
        );

        if (success) {
          setInputText('');
        }
      }
    } catch (error) {
      console.error('메시지 전송 에러:', error);
    }
  };

  // 13. 채팅방 나가기
  const handleLeaveRoom = async () => {
    if (!window.confirm('채팅방을 나가시겠습니까?')) {
      return;
    }

    try {
      const res = await Api.postRequest(
        `/api/chat-room/${roomId}/leave`,
        {},
        'POST'
      );

      if (res && res.isAvailable) {
        alert('채팅방을 나갔습니다.');
        navigate('/service/items/list/1');
      }
    } catch (error) {
      console.error('채팅방 나가기 에러:', error);
      alert('나가기 실패');
    }
  };

  // 14. 날짜 변환
  const parseToDayjs = (createdAt) => {
    if (!createdAt) {
      return dayjs();
    }

    // LocalDateTime이 배열로 반환되는 경우
    if (Array.isArray(createdAt)) {
      const [
        year,
        month,
        day,
        hour = 0,
        minute = 0,
        second = 0
      ] = createdAt;

      return dayjs(
        new Date(year, month - 1, day, hour, minute, second)
      );
    }

    return dayjs(createdAt);
  };

  // 15. 반환값
  return {
    roomInfo,
    messages,
    inputText,
    setInputText,
    previewUrl,
    loading,
    messageAreaRef,
    fileInputRef,
    handleFileChange,
    clearSelectedImage,
    handleSubmit,
    handleLeaveRoom,
    parseToDayjs
  };
}