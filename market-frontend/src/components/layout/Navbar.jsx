import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";

function Navbar() {
  // 1. 날씨 상태 관리
  const [weather, setWeather] = useState({ temp: '-', humidity: '-', pop: '-' });
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);

  // 2. 알림 상태 관리
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 3. 유저 정보 및 인증 상태 관리
  const { user, isAuthenticated, handleLogout, isAuthLoading } = useAuth();

  // 컴포넌트가 처음 렌더링될 때 실행
  // 날씨 조회
useEffect(() => {
  fetchWeather();
}, []);

// 로그인된 사용자에게만 알림 조회 및 SSE 연결
useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchUnreadNotifications();

    const eventSource = new EventSource('/api/notifications/subscribe');

    eventSource.onopen = () => {
      console.log('[Notification] SSE 연결 성공!');
    };

    eventSource.addEventListener('notification', (event) => {
      try {
        const newNotification = JSON.parse(event.data);

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } catch (error) {
        console.error('[Notification] 데이터 파싱 에러:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('[Notification] SSE 에러 발생:', error);
    };

    // Navbar가 사라지거나 로그아웃되면 SSE 연결 종료
    return () => {
      eventSource.close();
    };
  }, [isAuthenticated]);

  // --- [] 날씨 API 호출 로직 ---
  const fetchWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          callWeatherApi(position.coords.latitude, position.coords.longitude);
        },
        () => {
          console.warn("⚠️ [Weather] 위치 접근 거부됨. 기본 좌표 사용.");
          callWeatherApi(37.5665, 126.9780);
        }
      );
    } else {
      callWeatherApi(37.5665, 126.9780);
    }
  };

  const callWeatherApi = (lat, lon) => {
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setWeather({
            temp: data.TMP || '-',
            humidity: data.REH || '-',
            pop: data.POP || '-',
          });
          setIsWeatherLoading(false);
        }
      })
      .catch((err) => {
        console.error(" [Weather] 날씨 조회 실패:", err);
        setIsWeatherLoading(false);
      });
  };

  // --- [3] 알림 조회 및 SSE 연동 로직 ---
  const fetchUnreadNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setNotifications(res.data);
          setUnreadCount(res.data.length);
        }
      })
      .catch((err) => console.error("❌ [Notification] 안읽은 알림 조회 실패:", err));
  };


  const handleMarkAsRead = (notificationId, targetUrl, e) => {
    e.preventDefault();
    fetch(`/api/notifications/${notificationId}/read`, { method: "PATCH" })
      .then(() => {
        if (targetUrl && targetUrl !== '#' && targetUrl !== 'null') {
          window.location.href = targetUrl;
        } else {
          window.location.reload();
        }
      })
      .catch((err) => console.error("❌ [Notification] 읽음 처리 실패:", err));
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case "ITEM_STATUS_CHANGED": return "📢 상품 상태 변경";
      case "DEAL_CONFIRMED": return "🤝 거래 확정";
      case "CHAT": return "💬 채팅 도착";
      case "SYSTEM": return "🔔 시스템 알림";
      default: return "🔔 알림";
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/service/items/list/1">중고거래 플랫폼</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto d-flex align-items-center">

            {/* 날씨 배지 영역 */}
            <li className="nav-item me-2">
              <div className="badge bg-white text-dark border shadow-sm p-2 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                {isWeatherLoading ? (
                  <span className="text-muted"><i className="bi bi-hourglass-split"></i> 날씨 정보 불러오는 중...</span>
                ) : (
                  <span>
                    <span className="text-danger fw-bold"><i className="bi bi-thermometer-half"></i> {weather.temp}</span>
                    <span className="text-primary ms-1"><i className="bi bi-droplet-fill"></i> {weather.humidity}</span>
                    <span className="text-info ms-1"><i className="bi bi-umbrella-fill"></i> {weather.pop}</span>
                  </span>
                )}
              </div>
            </li>

            {/* 비로그인 상태 */}
           {!isAuthLoading && !isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/service/users/auth/register">회원가입</Link>
                </li>
                <li className="nav-item">
                  <Link to="/service/users/auth/login" className="btn btn-outline-primary">로그인</Link>
                </li>
              </>
            )}

            {/* 로그인 상태 */}
           {!isAuthLoading && isAuthenticated && (
              <>
                {/* 알림 드롭다운 */}
                <li className="nav-item dropdown me-2">
                  <a className="nav-link position-relative" href="#" id="notificationDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="bi bi-bell fs-5"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger"
                       style={{ fontSize: '0.65rem' }}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="notificationDropdown" style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }}>
                    <li className="dropdown-header border-bottom pb-2 fw-bold d-flex justify-content-between align-items-center">
                      <span>새로운 알림</span>
                      <span className="badge bg-primary rounded-pill">{unreadCount}</span>
                    </li>
                    
                    {notifications.length === 0 ? (
                      <li className="text-center py-4 text-muted">
                        <i className="bi bi-bell-slash fs-3 d-block mb-2"></i>
                        <span className="small">새로운 알림이 없습니다.</span>
                      </li>
                    ) : (
                      notifications.map((notification) => (
                        <li key={notification.id} className="border-bottom notification-item">
                          <a className="dropdown-item py-2 px-3 text-wrap" href={notification.targetUrl || '#'} 
                              onClick={(e) => handleMarkAsRead(notification.id, notification.targetUrl, e)}>
                            <div className="fw-bold small text-primary mb-1">{getNotificationTitle(notification.type)}</div>
                            <div className="small text-dark mb-1" style={{ fontSize: '0.85rem' }}>{notification.content}</div>
                            <div className="text-muted text-end" style={{ fontSize: '0.7rem' }}>{notification.createdAt || '방금 전'}</div>
                          </a>
                        </li>
                      ))
                    )}
                  </ul>
                </li>

                {/* 프로필 영역 (실제 user 데이터의 닉네임과 프로필 이미지 바인딩) */}
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center gap-2 fw-semibold" to="/service/users/profile/mypage">
                   <img
                      src={`http://localhost:8080${user?.profileUrl || '/images/default-profile.png'}`}
                      className="rounded-circle border"
                      style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                      alt="프로필"
                    />
                    <span className="small text-dark">{user?.nickname || '사용자'}님</span>
                  </Link>
                </li>
                
                {/* 로그아웃 버튼 (실제 handleLogout 함수 연결) */}
                <li className="nav-item">
                  <a className="nav-link" href="#" role="button" style={{ cursor: 'pointer' }} onClick={handleLogout}>로그아웃</a>
                </li>
              </>
            )}

            {/* 관리자 메뉴 (유저가 ADMIN 권한일 때만 보이도록 조건부 처리 추가) */}
            {user?.role === 'ADMIN' && (
              <li className="nav-item">
                <Link className="nav-link text-danger fw-bold" to="/service/admin/dashboard">관리자</Link>
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;