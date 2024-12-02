package com.backend.cosmetic.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.ProductDistributionDto;
import com.backend.cosmetic.dto.RevenueChartData;
import com.backend.cosmetic.dto.RevenueStatsDto;
import com.backend.cosmetic.dto.TopSellingProductDto;
import com.backend.cosmetic.model.OrderStatus;
import com.backend.cosmetic.repository.OrderRepository;
import com.backend.cosmetic.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StatisticService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public Long todayRevenue() {
        return orderRepository.getTodayRevenue(LocalDateTime.now());
    }
    public Integer totalOrder() {
        return (int) orderRepository.count();
    }

    public Integer conversionRate() {
        int total = totalOrder();
        if (total == 0) return 0;
        
        Long completed = orderRepository.countByStatus(OrderStatus.SUCCESS);
        return (completed != null ? (int)((completed * 100.0) / total) : 0);
    }

    public Integer pendingOrder() {
        Long pending = orderRepository.countByStatus(OrderStatus.PENDING);
        return pending != null ? pending.intValue() : 0;
    }

    public List<RevenueStatsDto> getRevenueStats() {
        List<Object[]> revenueStats = orderRepository.getRevenueStats();
        return revenueStats.stream()
            .map(obj -> new RevenueStatsDto(
                obj[0].toString(),  // date as String instead of List<String>
                ((Number) obj[1]).longValue(),  // orderCount
                ((Number) obj[2]).longValue()   // revenue
            ))
            .collect(Collectors.toList());
    }

    public List<ProductDistributionDto> getProductDistribution() {
        
    List<Object[]> productDistribution = productRepository.getProductDistribution();
        return productDistribution.stream()
            .map(obj -> new ProductDistributionDto((String) obj[0], ((Number) obj[1]).longValue(), ((Number) obj[2]).doubleValue()))
            .collect(Collectors.toList());
    }   

    public List<TopSellingProductDto> getTopSellingProducts(Pageable pageable) {
        List<Object[]> topSellingProducts = productRepository.getTopSellingProducts(pageable);
        return topSellingProducts.stream()
            .map(obj -> new TopSellingProductDto((Long) obj[0], (String) obj[1], (String) obj[2], ((Number) obj[3]).intValue(), ((Number) obj[4]).longValue(), (String) obj[5], (Boolean) obj[6]))
            .collect(Collectors.toList());
    }

    public Long getRevenue(String type) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;
        
        switch (type) {
            case "day":
                startDate = now.withHour(0).withMinute(0).withSecond(0);
                break;
            case "month":
                startDate = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                break;
            case "year":
                startDate = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0);
                break;
            default:
                throw new IllegalArgumentException("Invalid type: " + type);
        }
        
        return orderRepository.getTotalRevenue(startDate, now);
    }

    public RevenueChartData getMonthlyRevenueChart(int year) {
        List<Object[]> monthlyStats = orderRepository.getMonthlyRevenueStats(year);
        
        List<String> labels = new ArrayList<>();
        List<Long> values = new ArrayList<>();
        Long total = 0l;
        for (Object[] stat : monthlyStats) {
            labels.add("Tháng " + stat[0].toString());
            values.add(((Number) stat[1]).longValue());
            total += ((Number) stat[2]).longValue();
        }
        
        return new RevenueChartData(labels, values, total);
    }

    public List<Integer> getAvailableYears() {
        return orderRepository.getAvailableYears();
    }
}
