package com.backend.cosmetic.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;

import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.response.ProductDetailResponse;
import com.backend.cosmetic.response.ProductImageResponse;
import com.backend.cosmetic.response.ProductResponse;

import org.springframework.data.domain.Page;
import org.springframework.scheduling.annotation.Async;

@Mapper(componentModel = "spring")
public interface ProductMapper {

   default ProductResponse toDTO(Product product){
    ProductResponse productResponse = new ProductResponse();

    productResponse.setId(product.getId());
    productResponse.setName(product.getName());
    productResponse.setDescription(product.getDescription());
    productResponse.setActivate(product.isActive());
    productResponse.setThumbnail(product.getThumbnail());
    productResponse.setBrand(product.getBrand().getName());
    productResponse.setCategory(product.getCategory().getName());

    productResponse.setProductImages(product.getProductImages().stream().map(productImage -> {
        return ProductImageResponse.builder()
                .url(productImage.getUrl())
                .build();
    }).collect(Collectors.toList()));

    productResponse.setProductDetails( ProductDetailMapper.INSTANCE.toResponseDtoList(  product.getProductDetails() ));

    return productResponse;
   }

   default List<ProductResponse> toDTOs(List<Product> products){
    return products.stream().map(this::toDTO).collect(Collectors.toList());
   }
   
   default Page<ProductResponse> toDTOs(Page<Product> products){
    return products.map(this::toDTO);
   }
}
