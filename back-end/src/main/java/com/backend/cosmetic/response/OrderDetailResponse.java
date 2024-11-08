package com.backend.cosmetic.response;

import com.backend.cosmetic.model.OrderDetail;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class OrderDetailResponse {
    private int id;
    private int quantity;
    private Long price;
    private ProductDetailResponse productDetail;

    public static OrderDetailResponse fromOrderDetail(OrderDetail orderDetail) {
        return OrderDetailResponse.builder()
                .id(orderDetail.getId())
                .quantity(orderDetail.getQuantity())
                .price(orderDetail.getPrice())
                .productDetail(ProductDetailResponse.fromProductDetail(orderDetail.getProductDetail()))
                .build();
    }
}
