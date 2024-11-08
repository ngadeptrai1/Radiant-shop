package com.backend.cosmetic.service;

import com.backend.cosmetic.dto.OrderCounterDTO;
import com.backend.cosmetic.dto.OrderDTO;
import com.backend.cosmetic.model.Order;
import com.backend.cosmetic.response.OrderResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

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
}
