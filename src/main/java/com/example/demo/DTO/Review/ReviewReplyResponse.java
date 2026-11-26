package com.example.demo.DTO.Review;

import com.example.demo.Entity.Review.Review_Reply;

import java.time.LocalDateTime;
import java.util.List;

public record ReviewReplyResponse(
        Long id,
        String nickname,
        String content,
        LocalDateTime createdAt,
        List<ReviewReplyResponse> children
) {
    public static ReviewReplyResponse from(Review_Reply reply) {
        return new ReviewReplyResponse(
                reply.getId(),
                reply.getUsers().getNickname(),
                reply.getContent(),
                reply.getCreatedAt(),
                reply.getChildren().stream()
                        .map(ReviewReplyResponse::from)
                        .toList()
        );
    }
}