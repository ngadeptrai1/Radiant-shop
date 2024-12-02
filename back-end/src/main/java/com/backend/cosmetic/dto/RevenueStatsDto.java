package com.backend.cosmetic.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueStatsDto {
    private String date;
    private Long orderCount;
    private Long revenue;
    
} 