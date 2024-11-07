package com.backend.cosmetic.response;

import com.backend.cosmetic.model.Voucher;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class VoucherResponse {
    private Long id;
    private String code;
    private String type;
    private Long value;
    private Long maxDiscountAmount;
    private Long minOrderAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private String description;

    // Getters and Setters

    // Static method to convert from Voucher to VoucherResponse using builder
    public static VoucherResponse fromVoucher(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .type(voucher.getType())
                .value(voucher.getValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .usageLimit(voucher.getUsageLimit())
                .description(voucher.getDescription())
                .build();
    }
}