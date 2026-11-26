package com.example.demo.Repository.Review;

import com.example.demo.Entity.Review.Review_Reply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.List;

public interface Review_ReplyRepository extends JpaRepository<Review_Reply, Long> {

    List<Review_Reply> findByReviewIdAndParentIsNullOrderByCreatedAtAsc(Long reviewId);
}
