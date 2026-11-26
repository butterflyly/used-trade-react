package com.example.demo.DTO.Review;

public record ReviewReplyRequest(
        Long parentId,
        String content
) {}