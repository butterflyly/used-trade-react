import React from 'react';
import { useParams, Link } from 'react-router-dom';

function ErrorPage() {
  const { status } = useParams();

  const errorMessages = {
    403: {
      title: '403 접근 권한이 없습니다.',
      message: '해당 페이지에 접근할 권한이 없습니다.'
    },
    404: {
      title: '404 페이지를 찾을 수 없습니다.',
      message: '요청하신 페이지가 존재하지 않거나 삭제되었습니다.'
    },
    500: {
      title: '500 서버 내부 오류',
      message: '시스템에 일시적인 문제가 발생했습니다.'
    }
  };

  const error = errorMessages[status] || {
    title: `${status} 오류`,
    message: '요청을 처리하는 중 문제가 발생했습니다.'
  };

  return (
    <div className="text-center p-5">
      <h1>{error.title}</h1>
      <p>{error.message}</p>
      <Link to="/service/items/list/1">
        메인 홈으로 가기
      </Link>
    </div>
  );
}

export default ErrorPage;