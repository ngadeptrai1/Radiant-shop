package com.backend.cosmetic.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.backend.cosmetic.model.Order;
import com.backend.cosmetic.response.OrderResponse;


@Mapper(componentModel= "spring")
public interface OrderMapper {
    OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);


    default OrderResponse toResponseDto(Order order) {
        OrderResponse response = new OrderResponse();
    response.setId(order.getId());
    response.setFullName(order.getFullName());
    response.setPhoneNumber(order.getPhoneNumber());
    response.setEmail(order.getEmail());
    response.setAddress(order.getAddress());
    response.setStatus(order.getStatus());
    response.setPaymentStatus(order.getPaymentStatus());
    response.setPaymentMethod(order.getPaymentMethod());
    response.setTotalOrderAmount(order.getTotalOrderAmount());
    response.setShippingCost(order.getShippingCost());
    response.setVoucherAmount(order.getVoucherAmount());
    response.setFinalAmount(order.getFinalAmount());
    response.setTotalItems(order.getTotalItems());
    response.setType(order.getType());
    response.setCreatedDate(order.getCreatedDate());
    response.setNote(order.getNote());
    response.setUserId(order.getUser() != null ? order.getUser().getId() : null);
    response.setVoucherCode(order.getVoucher() != null ? order.getVoucher().getCode() : null);
    response.setReason(order.getReason());
    return response;
    }

   default List<OrderResponse> toResponseDtoList(List<Order> orders) {
        return orders.stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }
}
