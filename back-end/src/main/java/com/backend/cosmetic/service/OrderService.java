package com.backend.cosmetic.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.OrderCounterDTO;
import com.backend.cosmetic.dto.OrderDTO;
import com.backend.cosmetic.response.OrderResponse;

@Service
public interface OrderService {
    List<OrderResponse> findAll(Pageable request);
    OrderResponse createInWebsite(OrderDTO order);
    OrderResponse createOrderInCounter(OrderCounterDTO order);
    OrderResponse findById(Long id);
    OrderResponse update(OrderDTO order,long id);
    List<OrderResponse> findByUserId(Long id,Pageable request);
    OrderResponse changeStatus(Long id, String status);
    OrderResponse delete(Long id);
    List<OrderResponse> findOrdersByStatus(String status, Pageable pageable);
    List<OrderResponse> findOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    OrderResponse updatePaymentStatus(Long orderId, String paymentStatus);
    Map<String, Object> getOrderStatistics(LocalDateTime startDate, LocalDateTime endDate);
    boolean cancelOrder(Long orderId, String reason);
}
