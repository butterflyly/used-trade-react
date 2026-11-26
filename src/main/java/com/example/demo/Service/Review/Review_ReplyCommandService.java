package com.example.demo.Service.Review;

import com.example.demo.DTO.Review.ReviewReplyRequest;
import com.example.demo.Entity.Review.Review;
import com.example.demo.Entity.Review.Review_Reply;
import com.example.demo.Entity.Users.Users;
import com.example.demo.Error.BusinessException;
import com.example.demo.Repository.Review.ReviewRepository;
import com.example.demo.Repository.Review.Review_ReplyRepository;
import com.example.demo.Service.Users.UserReadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class Review_ReplyCommandService {

    private final ReviewRepository reviewRepository;
    private final UserReadService userReadService;
    private final Review_ReplyRepository reviewReplyRepository;

    public void createReviewReply(
            Long reviewId,
            String username,
            ReviewReplyRequest request
    ) {
        // 리뷰 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new BusinessException("해당 리뷰는 존재하지 않습니다."));

        // 사용자 조회
        Users users = userReadService.getUserEntity(username);


        // 부모 댓글 조회 (일반 댓글이면 null)
        Review_Reply parentReply = null;

        if (request.parentId() != null) {
            parentReply = reviewReplyRepository.findById(request.parentId())
                    .orElseThrow(() -> new BusinessException("부모 댓글이 존재하지 않습니다."));

            if (!parentReply.getReview().getId().equals(reviewId)) {
                throw new BusinessException("잘못된 댓글 요청입니다.");
            }

            if (parentReply.getParent() != null) {
                throw new BusinessException("대댓글에는 추가 답글을 작성할 수 없습니다.");
            }
        }

        // 작성 권한 확인
        boolean isWriter = review.getWriter().getUsername().equals(username);
        boolean isReceiver = review.getReceiver().getUsername().equals(username);

        if (parentReply == null && !isWriter) {
            throw new BusinessException("일반 댓글 작성 권한이 없습니다.");
        }

        if (parentReply != null && !isWriter && !isReceiver) {
            throw new BusinessException("대댓글 작성 권한이 없습니다.");
        }



        // 댓글 생성
        Review_Reply reviewReply = Review_Reply.builder()
                .review(review)
                .parent(parentReply)
                .users(users)
                .content(request.content())
                .build();



        reviewReplyRepository.save(reviewReply);


    }
}
