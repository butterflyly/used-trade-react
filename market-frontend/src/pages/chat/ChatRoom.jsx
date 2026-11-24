import React from 'react';
import { Link } from 'react-router-dom';
import { useChatRoom } from './useChatRoom';
import './chat-room.css';

function ChatRoom({ roomId, floating = false }) {
  const {
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
  } = useChatRoom(roomId);

  if (loading || !roomInfo) return <div className="text-center my-5">로딩 중...</div>;

  return (
    <div className="container chat-container my-4">
      <div className="card shadow-sm border-0 mx-auto chat-card">

        {/* 상단 헤더 영역 */}
        <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <Link to={`/service/items/detail/${roomInfo.itemId}`} className="text-decoration-none">
             <img
                src={`http://localhost:8080${roomInfo.itemImageUrl || '/images/default-item.png'}`}
                className="rounded border"
                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                alt="상품이미지"
              />
            </Link>
            <div>
              <h6 className="fw-bold mb-0 text-dark">{roomInfo.itemTitle}</h6>
              <small className="text-muted">
                <span>{roomInfo.partnerNickname}</span>님과의 대화
              </small>
            </div>
          </div>
          <button className="btn btn-outline-danger btn-sm border-0" onClick={handleLeaveRoom}>
            <i className="fa-solid fa-right-from-bracket"></i> 나가기
          </button>
        </div>

        {/* 메시지 출력 영역 */}
        <div className="card-body p-4" id="message-area" ref={messageAreaRef} style={{ height: '400px', overflowY: 'auto' }}>
          {messages.map((msg, index) => {

            // 1. 날짜 구분선 조건 판별 
            // 조건: 첫번째 메시지(index == 0)이거나, '이전 메시지의 작성일자'와 '현재 메시지의 작성일자'가 다를 때 
            // 1) 현재 메시지의 날짜 (YYYY-MM-DD 형식으로 변환)
            const currentDate = parseToDayjs(msg.createdAt).format('YYYY-MM-DD');

            // 2) 이전 메시지가 존재한다면, 이전 메시지의 날짜도 구함
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const prevDate = prevMessage ? parseToDayjs(prevMessage.createdAt).format('YYYY-MM-DD') : null;

            // 3) 조건 판별: 첫 번째 메시지이거나 OR 이전 날짜와 현재 날짜가 다를 때!
            const showDateSeparator = index === 0 || currentDate !== prevDate;

            // 화면에 불필요한 DOM 요소를 만들지 않고 여러 개의 자식 요소를 하나로 묶어주는 리액트 전용 포장지
            return (
              <React.Fragment key={msg.id || index}>
                {/* 날짜가 바뀔 때만 렌더링되는 구분선 */}
                {showDateSeparator && (
                    <div className="d-flex justify-content-center my-3 w-100 date-separator" data-date={currentDate}>
                        <div className="bg-light text-muted small px-3 py-1 rounded-pill shadow-sm border">
                            <i className="fa-regular fa-calendar me-1"></i> 
                            {parseToDayjs(msg.createdAt).format('YYYY년 M월 D일 dddd')}
                        </div>
                    </div>
                )}

                {/* 2. 시스템 공지 */}
                {msg.type === 'NOTICE' && (
                 <div className="d-flex justify-content-center my-3 w-100">
                  <div className="bg-light text-muted small px-3 py-1 rounded-pill shadow-sm border">
                      <i className="fa-solid fa-info-circle me-1"></i>
                      <span>{msg.content}</span>
                  </div>
                </div>
              )}

              {/* 3. 상대방 메시지 */}
              {!msg.isMine && msg.type !== 'NOTICE' && (
                  <div className="d-flex mb-3 justify-content-start w-100">
                      <div className="chat-bubble shadow-sm partner-bubble">
                          <p className="mb-1 small fw-bold text-primary">{msg.senderNickname}</p>
                          
                          {/* 텍스트 메시지일 때 (오타 'TAKL' -> 'TALK' 수정) */}
                          {msg.type === 'TALK' && (
                              <div className="message-content">{msg.content}</div>
                          )}
                          
                          {/* 이미지 메시지일 때 */}
                        {msg.type === 'IMAGE' && (
  <>
                        {console.log('채팅 이미지 원본 URL:', msg.content)}
                        <img
                          src={msg.content}
                          className="chat-img-content"
                          style={{ maxWidth: '200px', borderRadius: '10px', cursor: 'pointer' }}
                          alt="채팅 이미지"
                        />
                      </>
                    )}

                          <div className="d-flex align-items-center justify-content-start gap-1 mt-1">
                              <small className="chat-time text-muted">
                                  {parseToDayjs(msg.createdAt).format('A h:mm')}
                              </small>
                          </div>
                      </div>
                  </div>
              )}

              {/* 4. 내 메시지 */}
              {msg.isMine && msg.type !== 'NOTICE' && (
                  <div className="d-flex mb-3 justify-content-end w-100">
                      <div className="chat-bubble shadow-sm mine-bubble">
                          
                          {/* 텍스트 메시지일 때 */}
                          {msg.type === 'TALK' && (
                              <div className="message-content">{msg.content}</div>
                          )}
                          
                          {/* 이미지 메시지일 때 */}
                          {msg.type === 'IMAGE' && (
                              <img 
                                  src={msg.content} 
                                  className="chat-img-content" 
                                  style={{ maxWidth: '200px', borderRadius: '10px', cursor: 'pointer' }} 
                                  alt="채팅 이미지" 
                              />
                          )}

                          {/* 하단 정보 (읽음 숫자 및 시간) */}
                          <div className="d-flex align-items-center justify-content-end gap-1 mt-1">
                              {/* 상대방이 안 읽었을 때(!msg.isRead)만 숫자 1 표시 */}
                              {!msg.isRead && (
                                  <small className="unread-count text-warning fw-bold" style={{ fontSize: '0.7rem' }}>
                                      1
                                  </small>
                              )}
                              
                              {/* 전송 시간 포맷팅 */}
                              <small className="chat-time text-muted">
                                  {parseToDayjs(msg.createdAt).format('A h:mm')}
                              </small>
                          </div>
                      </div>
                  </div>
              )}
            </React.Fragment>

            );
          })}
        </div>

        {/* 하단 입력 및 푸터 영역 */}
        <div className="card-footer bg-white border-top p-3 position-relative">
          {previewUrl && (
            <div id="image-preview-container" className="mb-2 position-relative" style={{ width: 'fit-content' }}>
              <img src={previewUrl} alt="미리보기" className="rounded border shadow-sm" style={{ width: '70px', height: '70px', objectFit: 'cover' }} />
              <button 
                type="button" 
                onClick={clearSelectedImage}
                className="btn btn-danger btn-sm rounded-circle position-absolute top-0 start-100 translate-middle p-0 d-flex align-items-center justify-content-center" 
                style={{ width: '20px', height: '20px', fontSize: '10px' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          <form id="chat-form" className="d-flex gap-2 align-items-center" onSubmit={handleSubmit}>
          <input 
              type="file" 
              id="chat-image-input" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <label htmlFor="chat-image-input" className="btn btn-outline-secondary mb-0" style={{ cursor: 'pointer' }} title="사진 첨부">
              <i className="fa-regular fa-image fs-5"></i>
            </label>

            <input 
              type="text" 
              id="message-input" 
              className="form-control border-0 bg-light"
              placeholder="메시지를 입력하세요..." 
              autoComplete="off"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button type="submit" className="btn btn-primary px-4">전송</button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default ChatRoom;