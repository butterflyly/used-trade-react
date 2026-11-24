package com.example.demo.Controller.Review;


import com.example.demo.DTO.CommonResponse;
import com.example.demo.DTO.Review.ReviewResponse;
import com.example.demo.DTO.Users.Response.UserDetailResponse;
import com.example.demo.Service.Review.ReviewReadService;
import com.example.demo.Service.Users.UserReadService;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/view/reviews")
@Slf4j
public class ReviewApiViewController {

    private final ReviewReadService reviewReadService;
    private final UserReadService userReadService;

    // 판매자 거래 후기 모아보기 (공개 페이지용)
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<CommonResponse<Map<String, Object>>> sellerReviewList(
            @PathVariable Long sellerId,
            @PageableDefault(size = 10) Pageable pageable) {

        UserDetailResponse targetUser = userReadService.getUserResponseDTOById(sellerId);
        Page<ReviewResponse> reviews = reviewReadService.getReviewsBySellerId(sellerId, pageable);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("targetUser", targetUser);
        responseData.put("reviews", reviews);

        return ResponseEntity.ok(
                new CommonResponse<>(true,"판매자 거래 후기에 접속하엿습니다",responseData)
        );
    }


    @GetMapping("/my")
    public ResponseEntity<CommonResponse<Page<ReviewResponse>>> myReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "WRITTEN") String type,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<ReviewResponse> reviews =
                reviewReadService.getMyReviews(
                        userDetails.getUsername(), type, pageable
                );

        return ResponseEntity.ok(
                new CommonResponse<>(true, "리뷰 목록 조회 성공", reviews)
        );
    }

    @GetMapping("/my/counts")
    public ResponseEntity<CommonResponse<Map<String, Long>>> getMyReviewCounts(
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Long> counts = new HashMap<>();
        counts.put("written",
                reviewReadService.countWrittenReviews(userDetails.getUsername()));
        counts.put("received",
                reviewReadService.countReceivedReviews(userDetails.getUsername()));

        log.info("작성자 카운트 : " +  counts.get("written"));
        log.info("리시브 카운트 : " +  counts.get("received"));


        return ResponseEntity.ok(
                new CommonResponse<>(true, "리뷰 개수 조회 성공", counts)
        );
    }
}
