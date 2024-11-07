package com.backend.cosmetic.dto;

import lombok.*;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class VoucherDTO {
    private String code;
    private String type;
    private Long value;
    private Long maxDiscountAmount;
    private Long minOrderAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private String description;
}
