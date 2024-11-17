package com.backend.cosmetic.response;

import com.backend.cosmetic.model.Product;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private boolean activate ;
    private String thumbnail;
    private List<ProductImageResponse> productImages;
    private CategoryResponse category;
    private BrandResponse brand;
    private List< ProductDetailResponse> productDetails;

    public static ProductResponse fromProduct(Product product){
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .activate(product.isActive())
                .thumbnail(product.getThumbnail())
                .brand(BrandResponse.fromBrand( product.getBrand()))
                .category(CategoryResponse.fromCategory(product.getCategory(),new HashSet<>()))
                .productImages(product.getProductImages().stream().map(productImage -> {
                    return ProductImageResponse.builder()
                            .id(productImage.getId())
                            .url(productImage.getUrl())
                            .build();
                }).collect(Collectors.toList()))
                .productDetails(product.getProductDetails().stream()
                        .map(ProductDetailResponse::fromProductDetail).collect(Collectors.toList()))
                .build();

    }
}
