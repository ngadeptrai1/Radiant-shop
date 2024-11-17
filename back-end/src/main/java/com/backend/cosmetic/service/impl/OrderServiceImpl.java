package com.backend.cosmetic.service.impl;

import java.util.LinkedList;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.backend.cosmetic.dto.OrderCounterDTO;
import com.backend.cosmetic.dto.OrderDTO;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.model.Order;
import com.backend.cosmetic.model.OrderDetail;
import com.backend.cosmetic.model.OrderStatus;
import com.backend.cosmetic.model.User;
import com.backend.cosmetic.repository.OrderDetailRepository;
import com.backend.cosmetic.repository.OrderRepository;
import com.backend.cosmetic.repository.ProductDetailRepository;
import com.backend.cosmetic.repository.UserRepository;
import com.backend.cosmetic.response.OrderResponse;
import com.backend.cosmetic.service.OrderService;
import com.backend.cosmetic.service.VoucherService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;

    private final UserRepository userRepo;

    private final VoucherService voucherService;

    private final ProductDetailRepository productDetailRepo;

    private final OrderDetailRepository orderDetailRepository;

    @Override
    public List<OrderResponse> findAll(Pageable request) {
       return   orderRepository.findAll(request).getContent().stream()
                .map(OrderResponse::fromOrder)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = {DataNotFoundException.class, Exception.class,NullPointerException.class})
    public OrderResponse createInWebsite(OrderDTO orderDTO) {
        if(orderDTO.getOrderDetails().isEmpty()|| orderDTO.getOrderDetails() == null ){
            throw new NullPointerException("Order must have more than 1 product");
        }
        Order order = Order.builder()
                .email(orderDTO.getEmail())
                .address(orderDTO.getAddress())
                .fullName(orderDTO.getFullName())
                .paymentMethod(orderDTO.getPaymentMethod())
                .note(orderDTO.getNote())
                .status(OrderStatus.PENDING)
                .phoneNumber(orderDTO.getPhoneNumber())
                .shippingCost(orderDTO.getShippingCost())
                .build();
        if(orderDTO.getUserId() != null || orderDTO.getUserId()>0){
            User user = userRepo.findById(orderDTO.getUserId()).orElseThrow(()->
                    new DataNotFoundException("Not found user")
            );
            order.setUser(user);
        }
        order = orderRepository.save(order);
        List<OrderDetail> orderDetails = new LinkedList<>();
        Order finalOrder = order;
        orderDTO.getOrderDetails().forEach(orderDetail -> {
            OrderDetail orderDetailDto = OrderDetail.builder()
                    .order(finalOrder)
                    .quantity(orderDetail.getQuantity())
                    .productDetail(productDetailRepo.findById(orderDetail.getProductDetailId()).orElseThrow(()->
                            new DataNotFoundException("Not found product detail")
                    ))
                    .price(productDetailRepo.findById(orderDetail.getProductDetailId()).orElseThrow(()->
                            new DataNotFoundException("Not found product detail ")
                    ).getSalePrice())
                    .build();
            orderDetails.add(orderDetailDto);});
        order.setOrderDetails(orderDetailRepository.saveAll(orderDetails));
        long totalAmount = order.getOrderDetails().stream().mapToLong(OrderDetail::getQuantity).sum();
        order.setTotalOrderAmount(totalAmount);
        order.setTotalItems(order.getOrderDetails().size());
        if (orderDTO.getVoucherCode()!= null && !orderDTO.getVoucherCode().isEmpty() ) {
            order.setVoucherAmount(voucherService.approveVoucher(orderDTO.getVoucherCode(), totalAmount));
        }
        order.setFinalAmount((totalAmount-order.getVoucherAmount())+ order.getShippingCost());
        order = orderRepository.save(order);

        // send mail

        return OrderResponse.fromOrder(order);
    }


    @Override
    @Transactional(rollbackFor = {DataNotFoundException.class, Exception.class,NullPointerException.class})
    public OrderResponse createOrderInCounter(OrderCounterDTO orderDTO) {
        Order order = Order.builder()
                .email(orderDTO.getEmail())
                .fullName(orderDTO.getFullName())
                .note(orderDTO.getNote())
                .status(OrderStatus.SUCCESS)
                .paymentStatus("success")
                .shippingCost(0)
                .build();

        order = orderRepository.save(order);
        List<OrderDetail> orderDetails = new LinkedList<>();
        Order finalOrder = order;
        orderDTO.getOrderDetails().forEach(orderDetail -> {
            OrderDetail orderDetailDto = OrderDetail.builder()
                    .order(finalOrder)
                    .quantity(orderDetail.getQuantity())
                    .productDetail(productDetailRepo.findById(orderDetail.getProductDetailId()).orElseThrow(()->
                            new DataNotFoundException("Not found product detail")
                    ))
                    .price(productDetailRepo.findById(orderDetail.getProductDetailId()).orElseThrow(()->
                            new DataNotFoundException("Not found product detail ")
                    ).getSalePrice())
                    .build();
            orderDetails.add(orderDetailDto);});
        order.setOrderDetails(orderDetailRepository.saveAll(orderDetails));
        long totalAmount = order.getOrderDetails().stream().mapToLong(OrderDetail::getQuantity).sum();
        order.setTotalOrderAmount(totalAmount);
        order.setTotalItems(order.getOrderDetails().size());
        if (orderDTO.getVoucherCode()!= null && !orderDTO.getVoucherCode().isEmpty() ) {
            order.setVoucherAmount(voucherService.approveVoucher(orderDTO.getVoucherCode(), totalAmount));
        }
        order.setFinalAmount((totalAmount-order.getVoucherAmount())+ order.getShippingCost());
        order = orderRepository.save(order);
        // send mail

        return OrderResponse.fromOrder(order);
    }

    @Override
    public OrderResponse findById(Long id) {
        return OrderResponse.fromOrder(orderRepository.findById(id).orElseThrow(()->
                new DataNotFoundException("Not found order ")));
    }

    @Override
    public OrderResponse update(OrderDTO orderdto, long id) {
        Order order = orderRepository.findById(id).orElseThrow(()->
                new DataNotFoundException("Not found order"));
        order.setStatus(orderdto.getStatus());
        order.setEmail(orderdto.getEmail());
        order.setAddress(orderdto.getAddress());
        order.setFullName(orderdto.getFullName());
        order.setNote(orderdto.getNote());
        order.setPhoneNumber(orderdto.getPhoneNumber());
        order = orderRepository.save(order);
        return OrderResponse.fromOrder(order);
    }

    @Override
    public List<OrderResponse> findByUserId(Long id, Pageable request) {
        return   orderRepository.findAllByUserId(id,request).getContent().stream()
                .map(OrderResponse::fromOrder)
                .toList();
    }

    @Override
    public OrderResponse changeStatus(Long id, String status) {
        Order order = orderRepository.findById(id).orElseThrow(()->
                new DataNotFoundException("Not found order"));
        order.setStatus(status);
        order = orderRepository.save(order);
        return OrderResponse.fromOrder(order);    }

    @Override
    public OrderResponse delete(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(()->
                new DataNotFoundException("Not found order"));
        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);
        return OrderResponse.fromOrder(order);
    }


}
