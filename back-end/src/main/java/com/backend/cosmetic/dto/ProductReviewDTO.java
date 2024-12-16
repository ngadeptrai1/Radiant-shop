package com.backend.cosmetic.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class ProductReviewDTO {
    private Long id;

    @NotNull(message = "Email cannot be null")
    @Email(message = "Email should be valid")
    private String email;

    @NotNull(message = "Phone number cannot be null")
    private String phoneNumber;

    @NotNull(message = "Full name cannot be null")
    @Size(min = 3, max = 100, message = "Full name must be between 3 and 100 characters")
    private String fullName;

    @NotNull(message = "Review text cannot be null")
    @NotEmpty
    private String reviewText;

    @NotNull(message = "Rating cannot be null")
    @Min(1)
    @Max(5)
    private int rating;

    @Nullable
    private LocalDateTime reviewDate = LocalDateTime.now();

    private boolean active = false;

    @NotNull(message = "Product ID cannot be null")
    private Long productId;

}
