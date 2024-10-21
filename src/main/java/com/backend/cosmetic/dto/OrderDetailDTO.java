package com.backend.cosmetic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class OrderDetailDTO {

    @NotNull(message = "Product id not null ")
    @JsonProperty(value = "product_detail_id")
    @Min(value = 1 ,message = "Product id invalid")
    private Long productDetailId;

    @Min(value = 1 , message = "Product quantity must be greater than 0 ")
    @Max(value = 1000 , message = "Product quantity must be less than 1000")
    private int quantity;
}
