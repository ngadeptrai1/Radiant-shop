package com.backend.cosmetic.service;

import java.util.List;

import com.backend.cosmetic.dto.ProductReviewDTO;

public interface ProductReviewService {
    ProductReviewDTO createReview(ProductReviewDTO reviewDTO);
    ProductReviewDTO updateReview(Long id, ProductReviewDTO reviewDTO);
    void deleteReview(Long id);
    ProductReviewDTO getReviewById(Long id);
    List<ProductReviewDTO> getAllReviews();
    List<ProductReviewDTO> getReviewsByProductId(Long productId);
    List<ProductReviewDTO> getActiveReviews();
    void approveReview(Long id);
    void rejectReview(Long id);
} 