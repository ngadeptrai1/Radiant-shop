package com.backend.cosmetic.service;

import java.util.List;

import com.backend.cosmetic.dto.ProductReviewDTO;
import com.backend.cosmetic.response.ProductReviewResponse;

public interface ProductReviewService {
    ProductReviewResponse createReview(ProductReviewDTO reviewDTO);
    ProductReviewResponse updateReview(Long id, ProductReviewDTO reviewDTO);
    void deleteReview(Long id);
    ProductReviewResponse getReviewById(Long id);
    List<ProductReviewResponse> getAllReviews();
    List<ProductReviewResponse> getReviewsByProductId(Long productId);
    List<ProductReviewResponse> getActiveReviews();
    void approveReview(Long id);
    void rejectReview(Long id);
    Double getAverageRating(Long productId);
} 