package com.backend.cosmetic.service.impl;

import com.backend.cosmetic.dto.OrderDTO;
import com.backend.cosmetic.model.Order;
import com.backend.cosmetic.repository.OrderDetailRepository;
import com.backend.cosmetic.repository.OrderRepository;
import com.backend.cosmetic.repository.ProductRepository;
import com.backend.cosmetic.repository.UserRepository;
import com.backend.cosmetic.response.OrderResponse;
import com.backend.cosmetic.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;

    private final OrderDetailRepository detailRepo;

    private final UserRepository userRepo;

    private final ProductRepository productRepo;

    @Override
    public List<OrderResponse> findAll(Pageable request) {
       return   orderRepository.findAll(request).getContent().stream()
                .map(OrderResponse::fromOrder)
                .toList();
    }

    @Override
    public OrderResponse createWithOutLogin(OrderDTO order) {
        return null;
    }

    @Override
    public OrderResponse createWithLogin(OrderDTO order) {
        return null;
    }

    @Override
    public OrderResponse createOrderInCounter(OrderDTO order) {
        return null;
    }

    @Override
    public OrderResponse findById(Long id) {
        return null;
    }

    @Override
    public OrderResponse update(OrderDTO order, long id) {
        return null;
    }

    @Override
    public List<OrderResponse> findByUserId(Long id, Pageable request) {
        return List.of();
    }

    @Override
    public OrderResponse changeStatus(Order order, String status) {
        return null;
    }

    @Override
    public OrderResponse delete(Long id) {
        return null;
    }
}
