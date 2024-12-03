package com.backend.cosmetic.dto;

public interface OrderDetailProjection {
    Long getId();

    int getQuantity();

    long getPrice();

    String getProductName();

    String getProductColor();

    String getThumbnail();

    long getProductDetailId();
}
