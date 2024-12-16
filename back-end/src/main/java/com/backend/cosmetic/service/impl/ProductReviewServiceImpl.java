package com.backend.cosmetic.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.ProductReviewDTO;
import com.backend.cosmetic.exception.ResourceNotFoundException;
import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.model.ProductReview;
import com.backend.cosmetic.repository.ProductRepository;
import com.backend.cosmetic.repository.ProductReviewRepository;
import com.backend.cosmetic.response.ProductReviewResponse;
import com.backend.cosmetic.service.ProductReviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductReviewServiceImpl implements ProductReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @Override
    public ProductReviewResponse createReview(ProductReviewDTO reviewDTO) {
        Product product = productRepository.findById(reviewDTO.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductReview review = ProductReview.builder()
            .email(reviewDTO.getEmail())
            .phoneNumber(reviewDTO.getPhoneNumber())
            .fullName(reviewDTO.getFullName()).rating(reviewDTO.getRating())
            .reviewText(reviewDTO.getReviewText())
            .reivewDate(reviewDTO.getReviewDate())
            .active(false)
            .product(product)
            .build();

            return ProductReviewResponse.fromProductReview(reviewRepository.save(review));
    }

    @Override
    public ProductReviewResponse updateReview(Long id, ProductReviewDTO reviewDTO) {
        ProductReview review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setEmail(reviewDTO.getEmail());
        review.setPhoneNumber(reviewDTO.getPhoneNumber());
        review.setFullName(reviewDTO.getFullName());
        review.setReviewText(reviewDTO.getReviewText());

        return ProductReviewResponse.fromProductReview(reviewRepository.save(review));
    }

    @Override
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review not found");
        }
        reviewRepository.deleteById(id);
    }

    @Override
    public ProductReviewResponse getReviewById(Long id) {
        return reviewRepository.findById(id)
            .map(ProductReviewResponse::fromProductReview)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    }

    @Override
    public List<ProductReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
            .map(ProductReviewResponse::fromProductReview)
            .collect(Collectors.toList());
    }

    @Override
    public List<ProductReviewResponse> getReviewsByProductId(Long productId) {
        return reviewRepository.findByProductId(productId).stream()
            .map(ProductReviewResponse::fromProductReview)
            .collect(Collectors.toList());
    }

    @Override
    public List<ProductReviewResponse> getActiveReviews() {
        return reviewRepository.findByActiveTrue().stream()
            .map(ProductReviewResponse::fromProductReview)
            .collect(Collectors.toList());
    }

    @Override
    public void approveReview(Long id) {
        ProductReview review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setActive(true);
        reviewRepository.save(review);
    }

    @Override
    public void rejectReview(Long id) {
        ProductReview review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setActive(false);
        reviewRepository.save(review);
    }

    @Override
    public Double getAverageRating(Long productId) {
        return reviewRepository.getAverageRating(productId);
    }
} 