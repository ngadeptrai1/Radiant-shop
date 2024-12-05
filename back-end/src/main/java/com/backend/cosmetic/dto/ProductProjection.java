package com.backend.cosmetic.dto;

public interface ProductProjection {
    Long getId();
    String getName();
    String getDescription();
    Boolean getActivate();
    String getThumbnail();
    String getCategory();
    String getBrand();
    Integer getQuantity();
}
