package com.backend.cosmetic.service;

import com.backend.cosmetic.dto.OrderDTO;
import com.backend.cosmetic.model.Order;
import com.backend.cosmetic.response.OrderResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface OrderService {
    List<OrderResponse> findAll(Pageable request);
    OrderResponse createWithOutLogin(OrderDTO order);
    OrderResponse createWithLogin(OrderDTO order);
    OrderResponse createOrderInCounter(OrderDTO order);
    OrderResponse findById(Long id);
    OrderResponse update(OrderDTO order,long id);
    List<OrderResponse> findByUserId(Long id,Pageable request);
    OrderResponse changeStatus(Order order, String status);
    OrderResponse delete(Long id);
}
