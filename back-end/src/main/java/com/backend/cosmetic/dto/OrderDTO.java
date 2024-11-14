package com.backend.cosmetic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class OrderDTO {
    @JsonProperty("user_id")
    private Long userId;
    @JsonProperty(value = "full_name")
    @Size(min = 6 , max = 100 ,message = "full name must be 6 - 100 character")
    @NotEmpty( message = "Full name can not be empty")
    private String fullName;
    @JsonProperty(value = "phone_number")
    @Size(min = 6 , max = 20 ,message = "phone number must be 6 - 20 character")
    @NotBlank(message = "Phone number can not blank")
    @NotEmpty(message = "Phone number can not be empty")
    private String phoneNumber;
    @Size(min = 6 , max = 200 ,message = "Address number must be 6 - 200 character")
    private String address;
    @Email(message = "email không hợp lệ")
    private String email;
    private String note;
    private String status;
    @Nullable
    @JsonProperty("voucher_code")
    private String voucherCode;
    @JsonProperty("payment_method")
    private String paymentMethod;
    @JsonProperty("shipping_cost")
    private Long shippingCost;
    @Size(min = 1, max = 50, message = "List size must be between 1 and 50 elements")
    @JsonProperty(value = "order_details")
    @Valid
    private List<OrderDetailDTO> orderDetails;

}