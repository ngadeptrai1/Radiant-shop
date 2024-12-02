package com.backend.cosmetic.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Table(name = "product_reviews")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductReview extends BaseModel{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "review_text",nullable = false,columnDefinition = "TEXT")
    private String reviewText;

    @Column(name = "reivew_date")
    private LocalDateTime reivewDate = LocalDateTime.now();

    private boolean active = true;

    @NotNull(message = "Rating cannot be null")
    private int rating;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference("product-reviews")
    private Product product;
}
