package com.backend.cosmetic.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueChartData {
    private List<String> labels;
    private List<Long> values;
    private Long total;
} 