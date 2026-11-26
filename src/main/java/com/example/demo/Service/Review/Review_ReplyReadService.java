package com.example.demo.Service.Review;

import com.example.demo.DTO.Review.ReviewReplyResponse;
import com.example.demo.Error.BusinessException;
import com.example.demo.Repository.Review.ReviewRepository;
import com.example.demo.Repository.Review.Review_ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Review_ReplyReadService {

    private final ReviewRepository reviewRepository;
    private final Review_ReplyRepository reviewReplyRepository;

    public List<ReviewReplyResponse> getReviewReplies(Long reviewId) {

        if (!reviewRepository.existsById(reviewId)) {
            throw new BusinessException("해당 리뷰는 존재하지 않습니다.");
        }

        return reviewReplyRepository
                .findByReviewIdAndParentIsNullOrderByCreatedAtAsc(reviewId)
                .stream()
                .map(ReviewReplyResponse::from)
                .toList();
    }
}
