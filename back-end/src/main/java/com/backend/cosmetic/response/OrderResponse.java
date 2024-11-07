package com.backend.cosmetic.response;

import com.backend.cosmetic.model.Order;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class OrderResponse {
    private Long id;
    private Long userId;
    private long shippingCost;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String address;
    private String note;
    private String status;
    private long totalOrderAmount;
    private long voucherAmount;
    private int totalItems;
    private long finalAmount;
    private String voucherCode;
    private String paymentMethod;
    private String paymentStatus;
    private List<OrderDetailResponse> orderDetails;

    public static OrderResponse fromOrder(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .address(order.getAddress())
                .fullName(order.getFullName())
                .phoneNumber(order.getPhoneNumber())
                .note(order.getNote())
                .status(order.getStatus())
                .totalOrderAmount(order.getTotalOrderAmount())
                .voucherAmount(order.getVoucherAmount())
                .totalItems(order.getTotalItems())
                .finalAmount(order.getFinalAmount())
                .totalItems(order.getTotalItems())
                .finalAmount(order.getFinalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderDetails(order.getOrderDetails().stream()
                        .map( OrderDetailResponse::fromOrderDetail).collect(Collectors.toList()))
                .build();
    }
}
