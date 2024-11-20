package com.backend.cosmetic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class OrderCounterDTO {

    private String fullName;

    private String phoneNumber;

    private String email;

    private String note;

    private String type;

    @NotEmpty(message = "Trạng thái đơn hàng không được để trống")
    private String status;


    @NotEmpty(message = "Phương thức thanh toán không được để trống") 
    private String paymentMethod;

    private String paymentStatus;


    private Long shippingCost;

    @Nullable

    private String voucherCode;

    @Size(min = 1, max = 50, message = "List size must be between 1 and 50 elements")
    @Valid
    @NotEmpty(message = "Chi tiết đơn hàng không được để trống")
    private List<OrderDetailDTO> orderDetails;
}
