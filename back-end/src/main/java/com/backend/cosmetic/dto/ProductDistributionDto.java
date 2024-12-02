package com.backend.cosmetic.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDistributionDto {
    private String categoryName;
    private Long productCount;
    private Double percentage;
} 