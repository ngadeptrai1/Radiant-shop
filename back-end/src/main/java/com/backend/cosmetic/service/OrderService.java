package com.backend.cosmetic.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.OrderCounterDTO;
import com.backend.cosmetic.dto.OrderDTO;
import com.backend.cosmetic.response.OrderDetailResponse;
import com.backend.cosmetic.response.OrderResponse;

@Service
public interface OrderService {
    List<OrderResponse> findAll();
    OrderResponse createInWebsite(OrderDTO order);
    OrderResponse createOrderInCounter(OrderCounterDTO order);
    OrderResponse findById(Long id);
    OrderResponse update(OrderDTO order, long id);
    List<OrderResponse> findByUserId(Long id);
    OrderResponse changeStatus(Long id, String status);
    OrderResponse delete(Long id);
    List<OrderResponse> findAllByStatusAndCreatedDateBetween(String status , LocalDateTime start, LocalDateTime end);
    List<OrderResponse> findOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    OrderResponse updatePaymentStatus(Long orderId, String paymentStatus);
    Map<String, Object> getOrderStatistics(LocalDateTime startDate, LocalDateTime endDate);
    OrderResponse cancelOrder(Long orderId, String reason);
    OrderResponse updateStatus(Long orderId, String status);
    OrderResponse confirmOrder(Long orderId);
    List<OrderDetailResponse> getOrderDetail(Long orderId);
    Map<String, Long> getOrderStatusStatistics();
    List<OrderResponse> getOrderByEmail(String email);
}
