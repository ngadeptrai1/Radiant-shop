package com.backend.cosmetic.response;

import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.model.ProductDetail;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductDetailResponse {
    private Long id;
    private Long salePrice;
    private Integer discount;
    private Integer quantity;
    private String color;
    private String productName;
    private Boolean active;
    private String thumbnail;

    public static ProductDetailResponse fromProductDetail(ProductDetail product) {
        return ProductDetailResponse.builder()
                .id(product.getId())
                .salePrice(product.getSalePrice())
                .discount(product.getDiscount())
                .quantity(product.getQuantity())
                .productName(product.getProduct().getName())
                .color((product.getColor().getName()))
                .thumbnail(product.getProduct().getThumbnail())
                .active(product.isActive())
                .build();
    }

}
