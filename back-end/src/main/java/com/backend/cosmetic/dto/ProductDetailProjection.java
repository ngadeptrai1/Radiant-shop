package com.backend.cosmetic.dto;

public interface ProductDetailProjection {
    Long getId();
    Double getSalePrice();
    Double getDiscount();
    Integer getQuantity();
    String getColor();
    String getProductName();
    Boolean getActive();
    String getThumbnail();
}