package com.backend.cosmetic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.backend.cosmetic.model.ProductReview;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    @Query("SELECT r FROM ProductReview r WHERE r.product.id = :productId AND r.active = true ")
    List<ProductReview> findByProductId(Long productId);
    List<ProductReview> findByActiveTrue();
    List<ProductReview> findByEmail(String email);
    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId AND r.active = true ")
    Double getAverageRating(Long productId);
}
