package com.backend.cosmetic.mapper;

import org.mapstruct.Mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.backend.cosmetic.response.ProductDetailResponse;

import com.backend.cosmetic.model.Color;
import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.model.ProductDetail;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel= "spring")
public interface ProductDetailMapper {
  ProductDetailMapper INSTANCE = Mappers.getMapper(ProductDetailMapper.class);

  default ProductDetailResponse toResponseDto(ProductDetail product) {

    ProductDetailResponse response = new ProductDetailResponse();
    response.setId(product.getId());
    response.setSalePrice(product.getSalePrice());
    response.setDiscount(product.getDiscount());
    response.setQuantity(product.getQuantity());
    response.setProductName(product.getProduct() != null ? product.getProduct().getName() : null);
    response.setColor(product.getColor() != null ? product.getColor().getName() : null);
    response.setThumbnail(product.getProduct() != null ? product.getProduct().getThumbnail() : null);
    response.setActive(product.isActive());
    return response;
  }

  default List<ProductDetailResponse> toResponseDtoList(List<ProductDetail> productDetails) {
    return productDetails.stream()
    .map(this::toResponseDto)
    .collect(Collectors.toList());
  }
}
