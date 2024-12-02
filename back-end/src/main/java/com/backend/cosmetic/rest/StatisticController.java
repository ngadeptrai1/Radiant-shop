package com.backend.cosmetic.rest;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cosmetic.dto.ProductDistributionDto;
import com.backend.cosmetic.dto.RevenueChartData;
import com.backend.cosmetic.dto.RevenueStatsDto;
import com.backend.cosmetic.dto.TopSellingProductDto;
import com.backend.cosmetic.service.StatisticService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticController {
    private final StatisticService statisticService;

    @GetMapping("/today-revenue")
    public ResponseEntity<?> todayRevenue() {
        return ResponseEntity.ok(statisticService.todayRevenue());
    }

    @GetMapping("/total-orders")
    public ResponseEntity<Integer> totalOrder() {
        return ResponseEntity.ok(statisticService.totalOrder());
    }

    @GetMapping("/conversion-rate")
    public ResponseEntity<Integer> conversionRate() {
        return ResponseEntity.ok(statisticService.conversionRate());
    }

    @GetMapping("/pending-orders")
    public ResponseEntity<Integer> pendingOrder() {
        return ResponseEntity.ok(statisticService.pendingOrder());
    }

    @GetMapping("/revenue-chart")
    public ResponseEntity<List<RevenueStatsDto>> getRevenueStats() {
        return ResponseEntity.ok(statisticService.getRevenueStats());
    }

    @GetMapping("/product-distribution")
    public ResponseEntity<List<ProductDistributionDto>> getProductDistribution() {
        return ResponseEntity.ok(statisticService.getProductDistribution());
    }

    @GetMapping("/top-selling")
    public ResponseEntity<List<TopSellingProductDto>> getTopSellingProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(statisticService.getTopSellingProducts(PageRequest.of(page, size)));
    }

    @GetMapping("/revenue/{type}")
    public ResponseEntity<Long> getRevenue(@PathVariable String type) {
        return ResponseEntity.ok(statisticService.getRevenue(type));
    }

    @GetMapping("/monthly-revenue/{year}")
    public ResponseEntity<RevenueChartData> getMonthlyRevenueChart(@PathVariable int year) {
        return ResponseEntity.ok(statisticService.getMonthlyRevenueChart(year));
    }

    @GetMapping("/available-years")
    public ResponseEntity<List<Integer>> getAvailableYears() {
        return ResponseEntity.ok(statisticService.getAvailableYears());
    }
}
