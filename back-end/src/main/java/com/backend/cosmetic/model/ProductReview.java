package com.backend.cosmetic.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Table(name = "product_reviews")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
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

    private boolean active = false;

    @ManyToOne(cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private Product product;
}
