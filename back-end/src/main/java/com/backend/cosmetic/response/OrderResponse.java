package com.backend.cosmetic.response;

import com.backend.cosmetic.model.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private Long id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String address;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private long totalOrderAmount;
    private long shippingCost;
    private long voucherAmount;
    private long finalAmount;
    private int totalItems;
    private String type;
    private LocalDateTime createdDate;
    private String note;
    private String voucherCode;
    private Long userId;
    private String reason;
}
