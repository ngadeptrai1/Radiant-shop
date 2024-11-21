package com.backend.cosmetic.service.impl;

import java.util.List;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.backend.cosmetic.dto.ProductDetailDTO;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.model.Color;
import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.model.ProductDetail;
import com.backend.cosmetic.repository.ColorRepository;
import com.backend.cosmetic.repository.ProductDetailRepository;
import com.backend.cosmetic.response.ProductDetailResponse;
import com.backend.cosmetic.service.ProductDetailService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ProductDetailServiceImpl implements ProductDetailService {

    private final ProductDetailRepository productDetailRepository;
    private final ColorRepository colorRepository;

    @Override
    @Async
    public List<ProductDetailResponse> save(List<ProductDetailDTO> productDetailDTOs, Product product) {
        List<ProductDetail> productDetails = productDetailDTOs.stream().map(productDetailDTO -> {
            Color color = colorRepository.findById(productDetailDTO.getColorId()).orElseThrow(() -> {
                return new DataNotFoundException("Color with id " + productDetailDTO.getColorId() + " Not found ");
            });
            ProductDetail productDetail = ProductDetail.builder()
                    .product(product)
                    .color(color)
                    .quantity(productDetailDTO.getQuantity())
                    .discount(productDetailDTO.getDiscount())
                    .salePrice(productDetailDTO.getSalePrice())
                    .build();
            productDetail.setActive(productDetailDTO.isActive());
            return productDetail;

        }).toList();

        List<ProductDetail> savedDetails = productDetailRepository.saveAll(productDetails);
        product.setProductDetails(savedDetails);
        return savedDetails.stream().map(ProductDetailResponse::fromProductDetail).toList();
    }

    @Override
    public List<ProductDetailResponse> update(List<ProductDetailDTO> productDetailDTOs, Product product) {
        List<ProductDetail> productDetails = productDetailDTOs.stream().map(productDetailDTO -> {
            // Validate color exists
            Color color = colorRepository.findById(productDetailDTO.getColorId()).orElseThrow(() -> {
                return new DataNotFoundException("Color with id " + productDetailDTO.getColorId() + " Not found ");
            });

            ProductDetail productDetail;
            if (productDetailDTO.getId() != null) {
                // Update existing product detail
                productDetail = productDetailRepository.findById(productDetailDTO.getId()).orElseThrow(() -> {
                    return new DataNotFoundException("Product detail with id " + productDetailDTO.getId() + " Not found ");
                });
                productDetail.setActive(productDetailDTO.isActive());
                productDetail.setColor(color);
                productDetail.setQuantity(productDetailDTO.getQuantity());
                productDetail.setDiscount(productDetailDTO.getDiscount());
                productDetail.setSalePrice(productDetailDTO.getSalePrice());
            } else {
                // Create new product detail
                productDetail = ProductDetail.builder()
                        .product(product)
                        .color(color)
                        .quantity(productDetailDTO.getQuantity())
                        .discount(productDetailDTO.getDiscount())
                        .salePrice(productDetailDTO.getSalePrice())
                        .build();
                productDetail.setActive(productDetailDTO.isActive());
            }
            return productDetail;
        }).toList();

        // Save all product details and update product
        List<ProductDetail> savedDetails = productDetailRepository.saveAll(productDetails);
        product.setProductDetails(savedDetails);
        
        return savedDetails.stream()
                .map(ProductDetailResponse::fromProductDetail)
                .toList();
    }

    @Override
    public ProductDetailResponse delete(Long id) {
        ProductDetail productDetail = productDetailRepository.findById(id).orElseThrow(() -> {
            return new DataNotFoundException("Product detail with id "+id + " Not found ");
        });
        productDetail.setActive(false);
        return ProductDetailResponse.fromProductDetail(productDetailRepository.save(productDetail));
    }

    @Override
    public ProductDetailResponse findById(Long id) {
        ProductDetail productDetail = productDetailRepository.findById(id).orElseThrow(() -> {
            return new DataNotFoundException("Product detail with id "+id + " Not found ");
        });
        return ProductDetailResponse.fromProductDetail(productDetail);
    }

    @Override
    public ProductDetailResponse updateQuantityByOne(Long id, String type) {
        ProductDetail productDetail = productDetailRepository.findById(id).orElseThrow(() -> 
            new DataNotFoundException("Product detail with id " + id + " not found"));
        
        if ("plus".equalsIgnoreCase(type)) {
            productDetail.setQuantity(productDetail.getQuantity() + 1);
        } else if ("minus".equalsIgnoreCase(type)) {
            if (productDetail.getQuantity() <= 0) {
                throw new DataNotFoundException("Cannot decrease quantity below 0");
            }
            productDetail.setQuantity(productDetail.getQuantity() - 1);
        } else {
            throw new DataNotFoundException("Invalid type. Must be 'plus' or 'minus'");
        }
        
        return ProductDetailResponse.fromProductDetail(productDetailRepository.save(productDetail));
    }

    @Override
    public ProductDetailResponse updateQuantityByAmount(Long id, int amount) {
        ProductDetail productDetail = productDetailRepository.findById(id).orElseThrow(() ->
            new DataNotFoundException("Product detail with id " + id + " not found"));
        
        int newQuantity = productDetail.getQuantity() + amount;
        if (newQuantity < 0) {
            throw new DataNotFoundException("Cannot set quantity below 0");
        }
        
        productDetail.setQuantity(newQuantity);
        return ProductDetailResponse.fromProductDetail(productDetailRepository.save(productDetail));
    }
}
