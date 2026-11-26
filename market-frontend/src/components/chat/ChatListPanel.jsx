
import React, { useEffect, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import Api from '../../api/api';

export default function ChatListPanel() {
    const { isChatListOpen, openChat } = useChat();

    const [role, setRole] = useState('BUYER');
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (!isChatListOpen) return;

        const fetchChatRooms = async () => {
            setLoading(true);

            try {
                const res = await Api.postRequest(
                    `/api/view/users/mypage/chats?role=${role}&page=${page}`,
                    null,
                    'GET'
                );

                setChatRooms(res.content || []);
                setTotalPages(res.totalPages || 0);
            } catch (err) {
                console.error('채팅 목록 조회 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChatRooms();
    }, [isChatListOpen, role, page]);

    const changeRole = (nextRole) => {
        setRole(nextRole);
        setPage(0);
    };

    if (!isChatListOpen) return null;

    return (
        <div className="chat-list-panel">
            <div className="chat-list-header">
                <strong>채팅</strong>
            </div>

            <div className="chat-list-tabs">
                <button
                    className={role === 'BUYER' ? 'active' : ''}
                    onClick={() => changeRole('BUYER')}
                >
                    구매
                </button>

                <button
                    className={role === 'SELLER' ? 'active' : ''}
                    onClick={() => changeRole('SELLER')}
                >
                    판매
                </button>
            </div>

            <div className="chat-list-content">
                {loading ? (
                    <p className="text-muted text-center p-3">
                        불러오는 중...
                    </p>
                ) : chatRooms.length === 0 ? (
                    <p className="text-muted text-center p-3">
                        채팅 내역이 없습니다.
                    </p>
                ) : (
                    chatRooms.map(chat => (
                        <button
                            key={chat.roomId}
                            className="chat-list-item"
                            onClick={() => openChat(chat.roomId)}
                        >
                            <div className="chat-list-avatar">
                                <i className="bi bi-person-fill"></i>
                            </div>

                            <div className="chat-list-info">
                                <strong>{chat.partnerNickname}</strong>
                                <span>{chat.itemTitle}</span>
                            </div>

                            <i className="bi bi-chevron-right"></i>
                        </button>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="chat-list-pagination">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(prev => prev - 1)}
                    >
                        이전
                    </button>

                    <span>{page + 1} / {totalPages}</span>

                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(prev => prev + 1)}
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
}
