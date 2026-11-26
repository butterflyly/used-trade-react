package com.example.demo.Controller.Review;

import com.example.demo.DTO.Review.ReviewReplyRequest;
import com.example.demo.DTO.Review.ReviewReplyResponse;
import com.example.demo.Service.Review.Review_ReplyCommandService;
import com.example.demo.Service.Review.Review_ReplyReadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews/{reviewId}/replies")
public class ReviewReplyApiController {

    private final Review_ReplyCommandService reviewReplyCommandService;
    private final Review_ReplyReadService reviewReplyReadService;

    // 리뷰 댓글 작성
    @PostMapping
    public ResponseEntity<?> createReviewReply(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid ReviewReplyRequest request
    ) {


        reviewReplyCommandService.createReviewReply(
                reviewId,
                userDetails.getUsername(),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "댓글 작성 성공"));
    }

    // 리뷰 댓글 조회
    @GetMapping
    public ResponseEntity<List<ReviewReplyResponse>> getReviewReplies(
            @PathVariable Long reviewId
    ) {
        return ResponseEntity.ok(
                reviewReplyReadService.getReviewReplies(reviewId)
        );
    }
}