package com.backend.cosmetic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class ProductDetailDTO {
    private long id;
    @NotNull(message = "Product  sale price cannot be null")
    @Min(value = 0, message = "Product sale price must be greater than or equal to 0 ")
    @Max(value = 10000000 ,message = "Product sale price must be less than 10 000 000 " )
    @JsonProperty(value = "sale_price")
    private Long salePrice;
    @Size(min = 0 , max = 30 , message = "Product discount is invalid")
    private int discount;
    @Min(value = 1, message = "Product quantity must be greater than or equal to 0 ")
    @Max(value = 1000 ,message = "Product quantity must be less than 1000 " )
    private int quantity;
    @NotNull(message = "Color id cannot be null")
    @Min(value = 0, message = "Color id is not valid ")
    @JsonProperty(value = "Color_id")
    private int colorId;
    @NotNull(message = "Product id cannot be null")
    @Min(value = 0, message = "Product id is not valid ")
    @JsonProperty(value = "Product_id")
    private Long productId;
}
