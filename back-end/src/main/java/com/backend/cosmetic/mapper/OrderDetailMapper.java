package com.backend.cosmetic.mapper;

import com.backend.cosmetic.model.OrderDetail;
import org.mapstruct.Mapper;
import com.backend.cosmetic.response.OrderDetailResponse;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface OrderDetailMapper {
   default OrderDetailResponse toResponseDto(OrderDetail orderDetail) {
    if (orderDetail == null) {
        return null;
    }
    OrderDetailResponse response = new OrderDetailResponse();

    response.setId(orderDetail.getId());
    response.setQuantity(orderDetail.getQuantity());
    response.setPrice(orderDetail.getPrice());
    response.setProductColor(orderDetail.getProductDetail().getColor().getName());
    response.setProductName(orderDetail.getProductDetail().getProduct().getName());
    response.setThumbnail(orderDetail.getProductDetail().getProduct().getThumbnail());
    return response;
   }
    default List<OrderDetailResponse> toResponseDtoList(List<OrderDetail> orderDetails) {
        return orderDetails.stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }
}
