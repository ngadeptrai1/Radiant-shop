package com.backend.cosmetic.response;

import com.backend.cosmetic.model.OrderDetail;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderDetailResponse {
    private Long id;
    private int quantity;
    private long price;
    private String productName;
    private String productColor;
    private String thumbnail;
    private long productDetailId;
    public static OrderDetailResponse fromOrderDetail(OrderDetail detail) {
        return OrderDetailResponse.builder()
                .id(detail.getId())
                .quantity(detail.getQuantity())
                .price(detail.getPrice())
                .productColor(detail.getProductDetail().getColor().getName())
                .productName(detail.getProductDetail().getProduct().getName())
                .thumbnail(detail.getProductDetail().getProduct().getThumbnail())
                .productDetailId(detail.getProductDetail().getId())
                .build();
    }
}
