
import React, { useEffect, useState } from 'react';
import Api from '../../api/api';

export default function ReviewReplies({ reviewId, allowRoot = false }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState('');
  const [parentId, setParentId] = useState(null);

  const [showInput, setShowInput] = useState(false);

  // 댓글 목록 조회
  const fetchReplies = async () => {
    try {
      const res = await Api.postRequest(
        `/api/reviews/${reviewId}/replies`,
        null,
        'GET'
      );

      setReplies(res || []);
    } catch (err) {
      console.error('리뷰 댓글 조회 실패', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [reviewId]);

  // 댓글 작성
  const handleSubmit = async () => {
    console.log('[댓글 작성 시작]', {
            reviewId,
            parentId,
            content
        });

    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
    const res = await Api.postRequest(
        `/api/reviews/${reviewId}/replies`,
        { parentId, content: content.trim() },
        'POST'
    );

    console.log('[댓글 작성 응답]', res);

    setContent('');
    setParentId(null);
    setShowInput(false);
    await fetchReplies();
   }catch (err) {
    
      console.error('[댓글 작성 실패]');
    console.error('에러 객체:', err);
    console.error('에러 메시지:', err.message);
    console.error('HTTP 상태 코드:', err.status);
    console.error('에러 스택:', err.stack);
    }
  };

  // 일반 댓글 작성창
  const openRootInput = () => {
    setParentId(null);
    setContent('');
    setShowInput(true);
  };

  // 대댓글 작성창
  const openChildInput = (replyId) => {
    setParentId(replyId);
    setContent('');
    setShowInput(true);
  };

  if (loading) {
    return <div className="text-muted small mt-3">댓글 불러오는 중...</div>;
  }

  return (
    <div className="mt-3 pt-3 border-top">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="fw-semibold small">
          <i className="bi bi-chat-dots me-1"></i>
          댓글 {replies.reduce(
            (count, reply) => count + 1 + (reply.children?.length || 0), 0
          )}개
        </span>

        {allowRoot && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={openRootInput}
          >
            댓글 작성
          </button>
        )}
      </div>

      {replies.length > 0 ? (
        <div>
          {replies.map(reply => (
            <div key={reply.id} className="mb-3">

              {/* 일반 댓글 */}
              <div className="bg-light rounded p-3">
                <div className="d-flex justify-content-between">
                  <strong className="small">{reply.nickname}</strong>
                  <small className="text-muted">
                    {reply.createdAt?.substring(0, 10)}
                  </small>
                </div>

                <p className="mb-2 mt-2 small" style={{ whiteSpace: 'pre-wrap' }}>
                  {reply.content}
                </p>

                <button
                  className="btn btn-sm btn-link p-0 text-decoration-none"
                  onClick={() => openChildInput(reply.id)}
                >
                  답글 달기
                </button>
              </div>

              {/* 대댓글 */}
              {reply.children?.map(child => (
                <div
                  key={child.id}
                  className="ms-4 mt-2 border-start ps-3"
                >
                  <div className="d-flex justify-content-between">
                    <strong className="small">{child.nickname}</strong>
                    <small className="text-muted">
                      {child.createdAt?.substring(0, 10)}
                    </small>
                  </div>

                  <p className="mb-0 mt-2 small" style={{ whiteSpace: 'pre-wrap' }}>
                    {child.content}
                  </p>
                </div>
              ))}

            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted small mb-3">
          아직 작성된 댓글이 없습니다.
        </p>
      )}

      {/* 댓글 작성 영역 */}
      {showInput && (
        <div className="mt-3">
          <div className="small text-muted mb-2">
            {parentId === null ? '일반 댓글 작성' : '답글 작성'}
          </div>

          <textarea
            className="form-control form-control-sm mb-2"
            rows="3"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="댓글을 입력해주세요."
          />

          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setShowInput(false)}
            >
              취소
            </button>

            <button
              className="btn btn-sm btn-primary"
              onClick={handleSubmit}
            >
              등록
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
