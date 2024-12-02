package com.backend.cosmetic.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopSellingProductDto {
    private Long id;
    private String name;
    private String thumbnail;
    private Integer soldQuantity;
    private Long revenue;
    private String category;
    private Boolean inStock;
} 