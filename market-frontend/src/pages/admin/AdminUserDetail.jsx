import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Api from '../../api/api';
import dayjs from 'dayjs';

export default function AdminUserDetail() {
  const { id } = useParams(); // URL 경로에서 유저 ID 추출 (예: /admin/users/detail/:id)
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 유저 상세 정보 로드
  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      const res = await Api.formRequest(`/api/view/admin/users/detail/${id}`, null, 'GET');
      if (res && res.isAvailable) {
        setUser(res.data);
      } else {
        alert("해당 회원 정보를 찾을 수 없습니다.");
        navigate('/service/admin/users/list');
      }
    } catch (error) {
      console.error("회원 상세 데이터를 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. 포렌식 증거 보존(삭제 제동) 토글 액션
  const handleTogglePreserve = async (e) => {
    e.preventDefault();
    const actionText = user.isPermanentPreserved ? "삭제 제동을 해제" : "30일 자동 영구 파기 대상에서 제외(영구 보존)";
    if (!window.confirm(`🚨 해당 유저의 데이터를 ${actionText}하시겠습니까?`)) return;

    try {
      const res = await Api.formRequest(`/api/admin/users/toggle-preserve/${id}`, {}, 'POST');
      if (res && res.isAvailable) {
        alert("처리가 완료되었습니다.");
        fetchUserDetail();
      }
    } catch (error) {
      alert("처리 중 에러가 발생했습니다.");
    }
  };

  // 2. 탈퇴 회원 원상복구 액션
  const handleRestoreDeleted = async (e) => {
    e.preventDefault();
    if (!window.confirm("🩹 해당 유저의 회원 탈퇴 기록을 무효화하고 즉시 정상 회원 상태로 전격 복구하시겠습니까?")) return;

    try {
      const res = await Api.formRequest(`/api/admin/users/restore-deleted/${id}`, { currentTab: 'ALL' }, 'POST');
      if (res && res.isAvailable) {
        alert("정상 회원으로 복구되었습니다.");
        navigate('/service/admin/users/list');
      }
    } catch (error) {
      alert("처리 중 에러가 발생했습니다.");
    }
  };

  // 3. 블랙리스트 규제 해제 액션
  const handleRestoreBlack = async (e) => {
    e.preventDefault();
    if (!window.confirm("🔄 이 유저의 블랙리스트 규제를 해제하고 다시 일반 서비스 이용 권한을 양도하시겠습니까?")) return;

    try {
      const res = await Api.formRequest(`/api/admin/users/restore-black/${id}`, { currentTab: 'ALL' }, 'POST');
      if (res && res.isAvailable) {
        alert("블랙리스트 규제가 해제되었습니다.");
        navigate('/service/admin/users/list');
      }
    } catch (error) {
      alert("처리 중 에러가 발생했습니다.");
    }
  };

  // 4. 직권 수동 강제 블랙 조치 액션
  const handleForceBlack = async (e) => {
    e.preventDefault();
    if (!window.confirm("🚨 [주의] 경고 카운트 단계와 상관없이 해당 회원을 즉시 차단 회원(Black)으로 영구 격하하시겠습니까?")) return;

    try {
      const res = await Api.formRequest(`/api/admin/users/force-black/${id}`, { currentTab: 'ALL' }, 'POST');
      if (res && res.isAvailable) {
        alert("해당 유저가 강제 블랙 조치되었습니다.");
        fetchUserDetail();
      }
    } catch (error) {
      alert("처리 중 에러가 발생했습니다.");
    }
  };

  if (loading) {
    return <div className="text-center my-5">회원 제재 관리 데이터 로딩 중...</div>;
  }

  if (!user) return null;

  
  return (
    <div className="container my-5">
      <div className="row g-4">
        {/* 관리자 사이드바 */}
        <div className="col-md-3">
          <AdminSidebar />
        </div>

        {/* 메인 영역 */}
        <div className="col-md-9">
          <div className="mb-4">
            <Link
              to="/service/admin/users/list"
              className="btn btn-sm btn-outline-dark"
            >
              <i className="bi bi-arrow-left me-1"></i>
              회원 목록으로 돌아가기
            </Link>
          </div>

          <div className="row g-4 align-items-start">
            {/* 회원 프로필 */}
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-dark text-white p-3">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <strong>
                      <i className="bi bi-person-circle me-2"></i>
                      회원 상세 프로필
                    </strong>
                    <span className="badge bg-warning text-dark font-monospace">
                      No. {user.id}
                    </span>
                  </div>
                  <div className="small text-muted mb-3">
                  <div className="mb-2">
                    <span className="fw-bold">탈퇴 처리일:</span>
                    <span className="ms-2">
                      {user.deletedAt
                        ? dayjs(user.deletedAt).format('YYYY-MM-DD HH:mm')
                        : '정보 없음'}
                    </span>
                  </div>

                 <div>
                  <strong>자동 삭제 예정일:</strong>

                  {user.isPermanentPreserved ? (
                    <span className="text-success ms-2">
                      영구 보존 중 (자동 삭제 제외)
                    </span>
                  ) : user.deletedAt ? (
                    <span className="ms-2">
                      {dayjs(user.deletedAt).add(1, 'month').format('YYYY-MM-DD HH:mm')}
                    </span>
                  ) : (
                    <span className="ms-2">삭제 예정일 정보 없음</span>
                  )}
                </div>
                </div>
                </div>

                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                   {user.profileUrl && user.profileUrl.trim() !== '' ? (
                    <img
                      src={user.profileUrl}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = 'none';
                      }}
                      className="rounded-circle border shadow-sm flex-shrink-0"
                      style={{
                        width: '84px',
                        height: '84px',
                        objectFit: 'cover'
                      }}
                      alt="프로필"
                    />
                  ) : (
                    <div
                      className="rounded-circle border shadow-sm flex-shrink-0 bg-light d-flex align-items-center justify-content-center"
                      style={{
                        width: '84px',
                        height: '84px'
                      }}
                    >
                      <i className="bi bi-person-fill text-secondary fs-1"></i>
                    </div>
                  )}

                    <div className="min-w-0">
                      <h3 className="fw-bold text-dark mb-1 text-break">
                        {user.nickname}
                      </h3>
                      <span className="text-muted small font-monospace">
                        @{user.username}
                      </span>
                    </div>
                  </div>

                  <div className="row g-4">
                    <div className="col-12">
                      <label className="small text-muted d-block mb-1">
                        이메일 주소
                      </label>
                      <div className="fw-bold text-dark text-break">
                        {user.email}
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="small text-muted d-block mb-1">
                        대표 디스플레이 닉네임
                      </label>
                      <div className="fw-bold text-dark">
                        {user.displayNickname || '-'}
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <label className="small text-muted d-block mb-1">
                        누적 경고 횟수
                      </label>
                      <div className="fs-5 fw-bold text-danger">
                        {user.warningCount} / 3회
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <label className="small text-muted d-block mb-2">
                        계정 상태
                      </label>
                      <div className="d-flex flex-wrap gap-2">
                        {user.deleted && (
                          <span className="badge bg-dark p-2">
                            탈퇴 회원
                          </span>
                        )}

                        {user.role === 'Black' && (
                          <span className="badge bg-danger p-2">
                            활동 정지 (Black)
                          </span>
                        )}

                        {user.role === 'NORMAL' && !user.deleted && (
                          <span className="badge bg-success p-2">
                            정상 회원
                          </span>
                        )}

                        {user.role === 'ADMIN' && (
                          <span className="badge bg-primary p-2">
                            관리자
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 관리자 조작 영역 */}
            <div className="col-lg-6">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-primary text-white p-3">
                  <strong>
                    <i className="bi bi-shield-lock me-2"></i>
                    관리자 권한 관리
                  </strong>
                </div>

                <div className="card-body p-3 p-md-4 bg-light">
                  <p className="small text-muted mb-4">
                    회원의 신고 내역과 소명 자료를 확인한 후
                    필요한 계정 조치를 진행할 수 있습니다.
                  </p>

                  <div className="d-flex flex-column gap-3">

                    {/* 삭제 회원에게만 표시 */}
                    {user.deleted && (
                      <div className="p-3 bg-white rounded border border-warning shadow-sm">
                        <div className="mb-3">
                          <h6 className="fw-bold text-dark mb-2">
                            <i className="bi bi-archive-fill text-warning me-2"></i>
                            삭제 데이터 보존 관리
                          </h6>

                          <span className={
                            user.isPermanentPreserved
                              ? "badge bg-danger"
                              : "badge bg-secondary"
                          }>
                            {user.isPermanentPreserved
                              ? "영구 보존 중"
                              : "30일 자동 삭제 대상"}
                          </span>
                        </div>

                        <div className="small text-muted mb-3">
                          <div className="mb-1">
                            삭제일: {user.deletedAt
                              ? dayjs(user.deletedAt).format('YYYY-MM-DD HH:mm')
                              : '삭제일 정보 없음'}
                          </div>

                          <div>
                            자동 삭제 예정일: {user.deletedAt
                              ? dayjs(user.deletedAt).add(30, 'day').format('YYYY-MM-DD HH:mm')
                              : '-'}
                          </div>
                        </div>

                        <p className="small text-muted">
                          수사 협조나 분쟁 증거 보존이 필요한 경우
                          영구 보존을 활성화할 수 있습니다.
                          영구 보존 해제 시 자동 삭제 유예 기간을
                          새로 시작하도록 처리하는 것을 권장합니다.
                        </p>

                        <form onSubmit={handleTogglePreserve}>
                          {!user.isPermanentPreserved ? (
                            <button
                              type="submit"
                              className="btn btn-outline-danger w-100 fw-bold"
                            >
                              <i className="bi bi-lock-fill me-1"></i>
                              영구 보존 설정
                            </button>
                          ) : (
                            <button
                              type="submit"
                              className="btn btn-outline-secondary w-100 fw-bold"
                            >
                              <i className="bi bi-unlock-fill me-1"></i>
                              영구 보존 해제
                            </button>
                          )}
                        </form>
                      </div>
                    )}

                    {/* 소프트 삭제 회원 복구 */}
                    {user.deleted && (
                      <div className="p-3 bg-white rounded border border-warning shadow-sm">
                        <h6 className="fw-bold text-warning mb-2">
                          <i className="bi bi-arrow-counterclockwise me-2"></i>
                          회원 탈퇴 복구
                        </h6>

                        <p className="small text-muted mb-3">
                          탈퇴 처리된 회원을 정상 회원으로 복구합니다.
                        </p>

                        <form onSubmit={handleRestoreDeleted}>
                          <button
                            type="submit"
                            className="btn btn-warning w-100 fw-bold text-dark"
                          >
                            탈퇴 상태 복구하기
                          </button>
                        </form>
                      </div>
                    )}

                    {/* 블랙 회원 제재 해제 */}
                    {!user.deleted && user.role === 'Black' && (
                      <div className="p-3 bg-white rounded border border-danger shadow-sm">
                        <h6 className="fw-bold text-danger mb-2">
                          <i className="bi bi-shield-x me-2"></i>
                          블랙 회원 제재 관리
                        </h6>

                        <p className="small text-muted mb-3">
                          블랙리스트 제재를 해제하고 정상 회원으로 복구합니다.
                          현재 구현된 복구 정책에 따라 경고 횟수가 초기화됩니다.
                        </p>

                        <form onSubmit={handleRestoreBlack}>
                          <button
                            type="submit"
                            className="btn btn-success w-100 fw-bold"
                          >
                            블랙리스트 제재 해제
                          </button>
                        </form>
                      </div>
                    )}

                    {/* 일반 회원 강제 블랙 */}
                    {!user.deleted && user.role === 'NORMAL' && (
                      <div className="p-3 bg-white rounded border shadow-sm">
                        <h6 className="fw-bold text-dark mb-2">
                          <i className="bi bi-shield-check text-success me-2"></i>
                          일반 회원 관리
                        </h6>

                        <p className="small text-muted mb-3">
                          심각한 이용 규정 위반이 확인된 경우
                          경고 횟수와 관계없이 관리자 직권으로
                          이용을 정지할 수 있습니다.
                        </p>

                        <form onSubmit={handleForceBlack}>
                          <button
                            type="submit"
                            className="btn btn-danger w-100 fw-bold"
                          >
                            직권 강제 블랙 조치
                          </button>
                        </form>
                      </div>
                    )}

                    {/* 관리자 계정 */}
                    {!user.deleted && user.role === 'ADMIN' && (
                      <div className="p-3 bg-white rounded border border-primary">
                        <h6 className="fw-bold text-primary mb-2">
                          <i className="bi bi-shield-check me-2"></i>
                          관리자 계정
                        </h6>
                        <p className="small text-muted mb-0">
                          시스템 관리자 계정입니다.
                          일반 회원 제재 기능은 제공되지 않습니다.
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}