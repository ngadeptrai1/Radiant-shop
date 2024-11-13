package com.backend.cosmetic.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
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
    @NotBlank(message = "Mã code không được để trống")
    @Pattern(regexp = "^[A-Za-z0-9_-]{4,20}$", message = "Mã code chỉ chứa 4-20 ký tự chữ và số, dấu gạch dưới hoặc gạch ngang")
    private String code;

    @NotNull(message = "Loại voucher không được để trống")
    private String type;

    @NotNull(message = "Giá trị giảm không được để trống")
    @Min(value = 1, message = "Giá trị giảm phải lớn hơn 0")
    private Long value;

    @Min(value = 1, message = "Giá trị giảm tối đa phải lớn hơn 0")
    private Long maxDiscountAmount;

    @NotNull(message = "Giá trị đơn hàng tối thiểu không được để trống")
    @Min(value = 0, message = "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0")
    private Long minOrderAmount;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @FutureOrPresent(message = "Ngày bắt đầu phải từ hôm nay trở đi")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDateTime endDate;

    @NotNull(message = "Giới hạn sử dụng không được để trống")
    @Min(value = 1, message = "Giới hạn sử dụng phải lớn hơn 0")
    private Integer usageLimit;

    private String description;

    private boolean active = true;
}
