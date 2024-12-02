package com.backend.cosmetic.service;

import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.OrderDetailDTO;
import com.backend.cosmetic.response.OrderDetailResponse;

@Service
public interface OrderDetailService {
    OrderDetailResponse addOrderDetail(Long orderId, OrderDetailDTO orderDetailRequest);
    OrderDetailResponse updateOrderDetail(Long orderDetailId, int quantity);
    void deleteOrderDetail(Long orderDetailId);
}
