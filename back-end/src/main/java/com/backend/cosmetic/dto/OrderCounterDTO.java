package com.backend.cosmetic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class OrderCounterDTO {
    @JsonProperty(value = "full_name")
    private String fullName;
    @JsonProperty(value = "phone_number")
    private String phoneNumber;
    private String email;
    private String note;
    private String status;
    @Nullable
    @JsonProperty("voucher_code")
    private String voucherCode;
    @Size(min = 1, max = 50, message = "List size must be between 1 and 50 elements")
    @JsonProperty(value = "order_details")
    @Valid
    private List<OrderDetailDTO> orderDetails;
}
