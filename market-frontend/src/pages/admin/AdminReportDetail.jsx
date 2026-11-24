import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Api from '../../api/api';

import dayjs from 'dayjs';

export default function AdminReportDetail() {
  const { id } = useParams(); // URL 경로에서 신고 ID 추출 (예: /admin/reports/:id)
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 신고 상세 정보 로드
  useEffect(() => {
    fetchReportDetail();
  }, [id]);

  const fetchReportDetail = async () => {
    try {
      const res = await Api.formRequest(`/api/view/admin/reports/detail/${id}`, null, 'GET');


      if (res && res.isAvailable) {
        setReport(res.data);
      } else {
        alert("해당 신고 정보를 찾을 수 없습니다.");
        navigate('/service/admin/reports/list');
      }
    } catch (error) {
      console.error("신고 상세 데이터를 불러오지 못했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. 사기 제재 액션 (블랙 + 글 삭제)
  const handleExecuteScam = async (e) => {
    e.preventDefault();
    if (!window.confirm("🚨 [영구 제재] 해당 게시글을 삭제하고 작성자를 즉시 블랙 회원으로 강등하시겠습니까?")) return;

    try {
      const res = await Api.formRequest(`/api/admin/reports/execute-scam/${id}`, {}, 'POST');
      if (res && res.isAvailable) {
        alert("처리가 완료되었습니다.");
        fetchReportDetail(); // 데이터 새로고침
      }
    } catch (error) {
      alert("처리 중 에러가 발생했습니다.");
    }
  };

  // 2. 일반 위반 제재 액션 (경고 + 글 삭제)
  const handleBlindItem = async (e) => {
    e.preventDefault();
    if (!window.confirm("⚠️ [일반 제재] 해당 게시글을 삭제하고 작성자에게 경고 1회를 무조건 부여하시겠습니까? (3회 누적 시 자동 블랙)")) return;

    try {
      const res = await Api.formRequest(`/api/admin/reports/blind-item/${id}`, {}, 'POST');
      if (res && res.isAvailable) {
        alert("처리가 완료되었습니다.");
        fetchReportDetail();
      }
    } catch (error) {
      alert("처리 중 에러가 발생했습니다.");
    }
  };

  // 3. 무혐의 종결 액션
  const handleProcessDismiss = async (e) => {
    e.preventDefault();
    if (!window.confirm("✅ 허위 신고 등으로 판단하여 아무런 제재 없이 단순 종결 처리하시겠습니까?")) return;

    try {
      const res = await Api.formRequest(`/api/admin/reports/process/${id}`, {}, 'POST');
      if (res && res.isAvailable) {
        alert("신고가 종결 처리되었습니다.");
        fetchReportDetail();
      }
    } catch (error) {
      alert("처리 중 에러가 발생했습니다.");
    }
  };

  if (loading) {
    return <div className="text-center my-5">신고 검토 데이터 로딩 중...</div>;
  }

  if (!report) return null;

  return (
    <div className="container my-5">
      <div className="row g-4">
        {/* 좌측 관리자 사이드바 */}
        <div className="col-md-3">
          <AdminSidebar />
        </div>

        {/* 우측 메인 검토 콘텐츠 */}
        <div className="col-md-9">
          {/* 목록으로 돌아가기 버튼 (이전 상태의 status 쿼리 유지) */}
          <div className="mb-4">
            <Link to={`/service/admin/reports/list?status=${report.status}`} className="btn btn-sm btn-outline-dark">
              <i className="bi bi-arrow-left"></i> 신고 리스트로 돌아가기
            </Link>
          </div>

          <div className="row g-4">
            {/* 좌측: 신고 접수 내용 및 대상 상품 정보 */}
            <div className="col-lg-8">
              <div className="card shadow-sm border-0 mb-4 bg-white">
                <div className="card-header bg-dark text-white py-3 fw-bold">
                  📌 신고 접수 개요 (No. <span>{report.id}</span>)
                </div>
                <div className="card-body p-4">
                  <div className="row g-3 border-bottom pb-3 mb-4">
                    <div className="col-md-6">
                      <small className="text-muted d-block">신고 사유 카테고리</small>
                      <span className="fs-5 fw-bold text-danger">{report.reportTypeDescription}</span>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted d-block">접수 시각</small>
                      <span className="fs-5 fw-bold text-dark">
                        {report.createdAt ? dayjs(report.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold text-secondary">
                      <i className="bi bi-chat-right-text-fill text-warning"></i> 신고자 진술 내용
                    </label>
                    <div className="p-3 border rounded bg-light" style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem' }}>
                      {report.content}
                    </div>
                  </div>

                  <div className="p-3 border rounded shadow-sm bg-white d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-secondary mb-1">신고 대상 상품</span>
                      <h5 className="fw-bold mb-1 text-dark">{report.targetItemTitle}</h5>
                      <span className="text-danger fw-bold small">
                        가격: {Number(report.targetItemPrice || 0).toLocaleString()}원
                      </span>
                    </div>
                    <Link to={`/service/items/detail/${report.targetItemId}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary fw-bold">
                      <i className="bi bi-box-arrow-up-right"></i> 원본 게시글 검토
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: 이해관계자 프로필 추적 및 제재 액션 */}
            <div className="col-lg-4">
              {/* 이해관계자 프로필 카드 */}
              <div className="card shadow-sm border-0 mb-4 bg-white">
                <div className="card-header bg-secondary text-white fw-bold py-3">
                  <i className="bi bi-people-fill"></i> 이해관계자 프로필 추적
                </div>
                <div className="card-body p-3">
                  <div className="mb-3 p-2 border-bottom">
                    <small className="text-danger fw-bold d-block mb-1">🚨 피신고자 (피의자)</small>
                    <span className="fw-bold text-dark fs-5">{report.sellerNickname}</span>
                    <small className="text-muted d-block">계정 ID: {report.sellerUsername}</small>
                    <Link to={`/service/admin/users/detail/${report.sellerId}`} className="btn btn-xs btn-outline-danger py-0 px-2 mt-2 font-monospace" style={{ fontSize: '0.8rem' }}>
                      회원 정조치 관리 ➔
                    </Link>
                  </div>
                  <div className="p-2">
                    <small className="text-success fw-bold d-block mb-1">👤 신고자 (원고)</small>
                    <span className="fw-bold text-dark">{report.reporterNickname}</span>
                    <small className="text-muted d-block">계정 ID: {report.reporterUsername}</small>
                  </div>
                </div>
              </div>

              {/* 제재 관리자 액션 카드 */}
              <div className="card shadow-sm border-danger">
                <div className="card-header bg-danger text-white fw-bold py-3">
                  <i className="bi bi-gavel"></i> 신고 제재 관리자 액션
                </div>
                <div className="card-body bg-light p-3">
                  {report.status === 'PENDING' ? (
                    <>
                      <p className="small text-muted mb-3">검토 결과에 따라 하단의 정책 버튼을 선택해 주세요. 처리 즉시 데이터가 반영됩니다.</p>
                      <div className="d-flex flex-column gap-2">
                        {/* 1. 사기 제재 */}
                        <form onSubmit={handleExecuteScam}>
                          <button type="submit" className="btn btn-danger w-100 fw-bold py-2 shadow-sm text-start">
                            <i className="bi bi-shield-slash-fill me-1"></i> [사기] 즉시 블랙 + 글 삭제
                          </button>
                        </form>

                        {/* 2. 일반 위반 제재 */}
                        <form onSubmit={handleBlindItem}>
                          <button type="submit" className="btn btn-warning w-100 fw-bold py-2 shadow-sm text-dark text-start">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i> [위반] 경고 부여 + 글 삭제
                          </button>
                        </form>

                        {/* 3. 무혐의 종결 */}
                        <form onSubmit={handleProcessDismiss}>
                          <button type="submit" className="btn btn-secondary w-100 fw-bold py-2 shadow-sm text-start">
                            <i className="bi bi-check-circle-fill me-1"></i> [무혐의] 단순 신고 종결
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <i className="bi bi-shield-check text-success fs-1"></i>
                      <h5 className="fw-bold text-success mt-2 mb-1">조치 완료된 신고 건</h5>
                      <small className="text-muted">
                        종결 일시: {report.processedAt ? dayjs(report.processedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}