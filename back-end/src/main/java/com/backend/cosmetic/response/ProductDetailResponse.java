package com.backend.cosmetic.response;

import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.model.ProductDetail;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ProductDetailResponse {

    @JsonProperty(value = "sale_price")
    private Long salePrice;

    private int discount;

    private int quantity;

    private int colorId;

    public static ProductDetailResponse fromProductDetail(ProductDetail product) {
        return ProductDetailResponse.builder()
                .salePrice(product.getSalePrice())
                .discount(product.getDiscount())
                .quantity(product.getQuantity())
                .colorId(product.getColor().getId())
                .build();
    }

}
