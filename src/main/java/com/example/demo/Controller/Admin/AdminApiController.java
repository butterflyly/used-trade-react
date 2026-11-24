package com.example.demo.Controller.Admin;

import com.example.demo.DTO.CommonResponse;
import com.example.demo.Service.Item.ItemCommandService;
import com.example.demo.Service.Report.ReportCommandService;
import com.example.demo.Service.Users.UserCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminApiController {

    private final ReportCommandService reportService;
    private final UserCommandService userCommandService;
    private final ItemCommandService itemCommandService;

    /**
     * 액션 1: 사기꾼 핵버튼
     */
    @PostMapping("/reports/execute-scam/{id}")
    public ResponseEntity<CommonResponse<Void>> executeScam(@PathVariable Long id) {
        reportService.executeScamSanction(id);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "사기 제재가 완료되었습니다.", null)
        );
    }

    /**
     * 액션 2: 일반 제재
     */
    @PostMapping("/reports/blind-item/{id}")
    public ResponseEntity<CommonResponse<Void>> blindItem(@PathVariable Long id) {
        reportService.blindItemWithWarning(id);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "게시글 블라인드 및 경고 처리가 완료되었습니다.", null)
        );
    }

    /**
     * 액션 3: 무혐의 처리
     */
    @PostMapping("/reports/process/{id}")
    public ResponseEntity<CommonResponse<Void>> processReport(@PathVariable Long id) {
        reportService.dismissReport(id);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "신고 무혐의 처리가 완료되었습니다.", null)
        );
    }

    /**
     * 임의 블랙 조치
     */
    @PostMapping("/users/force-black/{id}")
    public ResponseEntity<CommonResponse<Void>> forceBlack(@PathVariable Long id) {
        userCommandService.forceBlackUser(id);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "회원 블랙 조치가 완료되었습니다.", null)
        );
    }

    /**
     * 블랙 해제 (정상 회원 복원)
     */
    @PostMapping("/users/restore-black/{id}")
    public ResponseEntity<CommonResponse<Void>> restoreBlack(@PathVariable Long id) {
        userCommandService.restoreBlackUser(id);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "회원 블랙 해제가 완료되었습니다.", null)
        );
    }

    /**
     * 소프트 삭제(탈퇴) 회원 복구
     */
    @PostMapping("/users/restore-deleted/{id}")
    public ResponseEntity<CommonResponse<Void>> restoreDeleted(@PathVariable Long id) {
        userCommandService.restoreDeletedUser(id);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "탈퇴 회원 복구가 완료되었습니다.", null)
        );
    }

    /**
     * 유저 영구 삭제 제동(보존/해제) 토글
     */
    @PostMapping("/users/toggle-preserve/{id}")
    public ResponseEntity<CommonResponse<Void>> toggleUserPreserve(@PathVariable Long id) {
        userCommandService.toggleUserPreservation(id);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "회원 보존 설정이 변경되었습니다.", null)
        );
    }

    /**
     * 게시글 직접 보고 작성자 경고 1회 부여 (+ 해당 게시글 즉시 숨김)
     */
    @PostMapping("/items/{itemId}/warn-seller")
    public ResponseEntity<CommonResponse<Void>> warnSellerByItem(@PathVariable Long itemId) {
        userCommandService.warnSellerByItem(itemId);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "작성자 경고 및 게시글 숨김 처리가 완료되었습니다.", null)
        );
    }

    /**
     * 게시글 직접 보고 작성자 즉시 영구 정지(블랙) (+ 해당 게시글 즉시 숨김)
     */
    @PostMapping("/items/{itemId}/black-seller")
    public ResponseEntity<CommonResponse<Void>> forceBlackSellerByItem(@PathVariable Long itemId) {
        userCommandService.forceBlackSellerByItem(itemId);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "작성자 블랙 조치 및 게시글 숨김 처리가 완료되었습니다.", null)
        );
    }

    /**
     * 게시글 영구 삭제 제동(보존/해제) 토글
     */
    @PostMapping("/items/toggle-preserve/{id}")
    public ResponseEntity<CommonResponse<Void>> toggleItemPreserve(@PathVariable Long id) {
        itemCommandService.toggleItemPreservation(id);

        return ResponseEntity.ok(
                new CommonResponse<>(true, "게시글 보존 설정이 변경되었습니다.", null)
        );
    }
}