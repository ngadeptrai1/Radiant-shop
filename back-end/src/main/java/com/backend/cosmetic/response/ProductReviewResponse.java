package com.backend.cosmetic.response;

import com.backend.cosmetic.model.ProductReview;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class ProductReviewResponse {

    private Long id;

    private String email;


    private String phoneNumber;


    private String fullName;


    private String reviewText;

    private LocalDateTime reivewDate ;

    private boolean active = false;

    private ProductResponse product;

    public static ProductReviewResponse fromProductReview(ProductReview productReview) {
        return ProductReviewResponse.builder()
                .id(productReview.getId())
                .email(productReview.getEmail())
                .phoneNumber(productReview.getPhoneNumber())
                .fullName(productReview.getFullName())
                .reviewText(productReview.getReviewText())
                .reivewDate(productReview.getReivewDate())
                .active(productReview.isActive())
                .product(ProductResponse.fromProduct(productReview.getProduct()))
                .build();
    }
}
