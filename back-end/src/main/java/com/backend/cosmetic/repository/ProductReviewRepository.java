package com.backend.cosmetic.repository;

import com.backend.cosmetic.model.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository   extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductId(Long productId);
}
