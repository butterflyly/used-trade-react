
package com.example.demo.Controller.Admin;

import com.example.demo.DTO.CommonResponse;
import com.example.demo.DTO.Report.ReportDetailResponse;
import com.example.demo.DTO.Report.ReportResponse;
import com.example.demo.DTO.Users.Response.AdminUserDetailResponse;
import com.example.demo.DTO.Users.Response.AdminUserResponse;
import com.example.demo.DTO.item.Response.ItemDetailResponse;
import com.example.demo.DTO.item.Response.ItemSummaryResponse;
import com.example.demo.Entity.Report.ReportStatus;
import com.example.demo.Service.Item.ItemReadService;
import com.example.demo.Service.Report.ReportViewService;
import com.example.demo.Service.Users.UserReadService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/view/admin")
public class AdminApiViewController {

    private final ItemReadService itemReadService;
    private final ReportViewService reportViewService;
    private final UserReadService userReadService;

    /*
     * 통합 메인 대시보드
     */
    @GetMapping({"", "/dashboard"})
    public ResponseEntity<CommonResponse<Map<String, Object>>> adminHome() {

        Map<String, Object> responseData = new HashMap<>();

        responseData.put("pendingReportCount", reportViewService.getPendingReportCount());
        responseData.put("deletedItemCount", itemReadService.getDeletedItemCount());
        responseData.put("blackUserCount", userReadService.getBlackUserCount());

        return ResponseEntity.ok(
                new CommonResponse<>(true, "관리자 대시보드 조회 성공", responseData)
        );
    }

    /*
     * 소프트 삭제된 게시글 통합 아카이브 조회
     */
    @GetMapping("/items/deleted-list")
    public ResponseEntity<CommonResponse<Page<ItemSummaryResponse>>> getDeletedItems(
            @RequestParam(value = "kw", defaultValue = "") String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "preserved", defaultValue = "false") boolean preserved) {

        Pageable pageable = PageRequest.of(
                page, 15, Sort.by("updatedAt").descending()
        );

        Page<ItemSummaryResponse> deletedItems =
                itemReadService.getDeletedItemsForAdmin(keyword, preserved, pageable);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "삭제 게시글 목록 조회 성공", deletedItems)
        );
    }

    /*
     * 소프트 삭제된 게시글 상세 내역 확인
     */
    @GetMapping("/items/deleted-detail/{itemId}")
    public ResponseEntity<CommonResponse<ItemDetailResponse>> getDeletedItemDetail(
            @PathVariable Long itemId) {

        ItemDetailResponse deletedItem =
                itemReadService.getDeletedItemDetailForAdmin(itemId);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "삭제 게시글 상세 조회 성공", deletedItem)
        );
    }

    /*
     * 접수된 신고 목록 보기
     */
    @GetMapping("/reports")
    public ResponseEntity<CommonResponse<Page<ReportResponse>>> getReports(
            @RequestParam(value = "status", defaultValue = "PENDING") ReportStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page) {

        Pageable pageable = PageRequest.of(
                page, 15, Sort.by("createdAt").descending()
        );

        Page<ReportResponse> reportPage =
                reportViewService.getReportList(status, pageable);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "신고 목록 조회 성공", reportPage)
        );
    }

    /*
     * 특정 신고 내용 상세 보기
     */
    @GetMapping("/reports/detail/{id}")
    public ResponseEntity<CommonResponse<ReportDetailResponse>> getReportDetail(
            @PathVariable Long id) {

        ReportDetailResponse reportDetail =
                reportViewService.getReportDetail(id);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "신고 상세 조회 성공", reportDetail)
        );
    }

    /*
     * 유저 관리 대시보드
     */
    @GetMapping("/users")
    public ResponseEntity<CommonResponse<Page<AdminUserResponse>>> userDashboard(
            @RequestParam(value = "tab", defaultValue = "ALL") String tab,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "preserved", defaultValue = "ALL") String preserved) {

        Pageable pageable = PageRequest.of(
                page, 15, Sort.by("id").descending()
        );

        Page<AdminUserResponse> userPage =
                userReadService.getTargetUserList(tab, keyword, preserved, pageable);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "회원 목록 조회 성공", userPage)
        );
    }

    /*
     * 유저 상세 요약 페이지
     */
    @GetMapping("/users/detail/{id}")
    public ResponseEntity<CommonResponse<AdminUserDetailResponse>> userDetail(
            @PathVariable Long id) {

        AdminUserDetailResponse userDetail =
                userReadService.getUserDetail(id);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "회원 상세 조회 성공", userDetail)
        );
    }
}
