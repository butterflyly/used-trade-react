import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import Api from '../../api/api';
import { useAuth } from "../../contexts/AuthContext";


// 전역 로케일을 'ko'로 설정 (기존 JS의 if문 역할 대체)
dayjs.locale('ko');

export function useChatRoom(roomIdProp) {
  const params = useParams();
  const roomId = roomIdProp ?? params.roomId;
  const navigate = useNavigate();

  const [roomInfo, setRoomInfo] = useState(null); // 채팅방 정보  
  const [messages, setMessages] = useState([]); // 메세지 
  const [inputText, setInputText] = useState(''); // 텍스트 
  const [selectedFile, setSelectedFile] = useState(null); // 파일선택 
  const [previewUrl, setPreviewUrl] = useState(''); // 이미지 미리보기 가상 URL
  const [loading, setLoading] = useState(true);
  const {
    isAuthenticated,
    isAuthLoading
  } = useAuth();


  // 컴포넌트가 살아있는 동안 계속 유지되는 '안전한 보관함(상자)'을 만드는 훅
  // stompClientRef (웹소켓 클라이언트 보관함)
  const stompClientRef = useRef(null);

  // messageAreaRef (채팅 스크롤 박스 DOM 보관함)
  const messageAreaRef = useRef(null);

  // 1. 채팅방 초기 정보 및 기존 메시지 불러오기
  useEffect(() => {
     if (isAuthLoading) return;

     if (!isAuthenticated) {
      navigate("/service/users/auth/login");
      return;
    }

    fetchChatRoomData();

    initWebSocket();

    return () => {
      if (stompClientRef.current) {
        // "저 이 방 나갑니다! 웹소켓 연결 안전하게 끊어주세요!"
        stompClientRef.current.deactivate(); 
      }
    };
  }, [isAuthLoading, isAuthenticated, roomId]);


 const fetchChatRoomData = async () => {
    try {
      const res = await Api.formRequest(`/api/view/chat-room/${roomId}`, null, 'GET');
      
      if (res) {
        // 1. 채팅방 및 거래 관련 기본 정보는 객체로 묶어서 관리
        setRoomInfo({
          roomId: res.roomId,
          itemTitle: res.itemTitle,
          itemImageUrl: res.itemImageUrl,
          itemId: res.itemId,
          partnerNickname: res.partnerNickname,
        });
        
        // 2. 메시지 목록은 따로 빼두어 기존 상태에 세팅
        setMessages(res.messages || []);
      }
    } catch (error) {
      console.error("채팅방 정보를 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 웹소켓 및 STOMP 초기화
  const initWebSocket = () => {
    const client = new Client({
        webSocketFactory: () => {
        return new SockJS('http://localhost:8080/ws-stomp');
      },
      reconnectDelay: 5000,
      debug: (str) => {
        console.log("STOMP Log: " + str);
      },
          

      // 중요: 서버와의 연결이 완전히 완료된 후 실행되는 콜백 함수
      onConnect: () => {
        console.log('✅ 웹소켓 연결 성공!');

         // 연결 완료 후 방 구독(Subscribe)
        client.subscribe(`/sub/chat/room/${roomId}`, (chatMessage) => {
          const msgBody = JSON.parse(chatMessage.body);


          if (msgBody.type === 'READ') {
        
            //  'messages' 상태를 업데이트
            setMessages(prevMessages => 
                prevMessages.map(msg => ({
                  // 점 세 개(...)는 "어떤 객체나 배열 안에 있는 내용물을 가감 없이 싹 펼쳐서(복사해서) 여기에 풀어놓아라"
                    ...msg,
                    isRead: true // 모든 메시지의 읽음 상태를 true로 변경
                }))
            );
            return;
          }

          setMessages((prev) => [...prev, msgBody]);
          
             //  접속한 유저와 보낸 사람(senderUsername)을 직접 비교
            const isMine = (msgBody.senderUsername === currentLoginUsername);

            // 내가 보낸 게 아니고, NOTICE도 아니라면 -> "나 이 메시지 읽었음" 신호 전파
            if (!isMine && msgBody.type !== 'NOTICE') {
                  console.log(" [READ 신호 전송] -> /pub/chat/read");
                  stompClientRef.current.publish({
                    destination: "/pub/chat/read",
                    body: JSON.stringify({ roomId: roomId })
                });
            }
          });
      },
      onStompError: (frame) => {
        console.error('❌ 웹소켓 브로커 에러:', frame);
      }
    });

    client.activate(); // 소켓가동 
    stompClientRef.current = client;
  };

  //  인풋 요소를 참조할 useRef 선언
  const fileInputRef = useRef(null);

  // 3. 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하만 가능합니다.");

      //  리액트식으로 인풋 값 초기화하기
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // 브라우저 메모리에 가상 주소 뚝딱 생성 후 상태 저장

  };

  // 4. 이미지 미리보기 취소
  const clearSelectedImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');

    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  // 5. 메시지 전송 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      alert("채팅 서버 연결 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    try {
      let contentToSend = inputText.trim();

      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const imgRes = await Api.formRequest('/api/chat/image', formData);

        if (imgRes && imgRes.isAvailable) {
          console.log('이미지 업로드 응답:', imgRes.data);

          sendStompMessage(imgRes.data, 'IMAGE');
          clearSelectedImage();
        } else {
          alert("이미지 업로드 실패");
          return;
        }
      }

      if (contentToSend) {
        sendStompMessage(contentToSend, 'TALK');
        setInputText('');
      }
    } catch (error) {
      console.error("전송 에러:", error);
    }
  };

  const sendStompMessage = (content, type) => {

    if (!stompClientRef.current || !stompClientRef.current.connected) {
        alert("웹소켓 연결이 끊어져 있습니다.");
        return;
    }

      const messagePayload = {
      roomId: roomId,
      content: content,
      type: type
    };

    //  try-catch로 퍼블리시 에러 방어
    try {
      stompClientRef.current.publish({
        destination: "/pub/chat/message",
        body: JSON.stringify(messagePayload)
      });
      return true; // 전송 성공
    } catch (error) {
      console.error("❌ 메시지 publish 에러:", error);
      return false; // 전송 실패
    }
  };

  // 6. 채팅방 나가기
  const handleLeaveRoom = async () => {
    if (!window.confirm("채팅방을 나가시겠습니까?")) return;
    try {
      const res = await Api.postRequest(`/api/chat-room/${roomId}/leave`, {}, "POST");
      if (res && res.isAvailable) {
        alert("채팅방을 나갔습니다.");
        navigate("/service/items/list/1");
      }
    } catch (error) {
      alert("나가기 실패");
    }
  };

  
 // 다양한 형태의 createdAt 데이터를 안전하게 dayjs 객체로 변환
 const parseToDayjs = (createdAt) => {
    if (!createdAt) return dayjs();

    if (Array.isArray(createdAt)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = createdAt;
        return dayjs(new Date(year, month - 1, day, hour, minute, second));
    }

    return dayjs(createdAt);
}

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