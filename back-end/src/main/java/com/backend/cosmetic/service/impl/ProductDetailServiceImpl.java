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
            Color color = colorRepository.findById(productDetailDTO.getColorId()).orElseThrow(() -> {
                return new DataNotFoundException("Color with id " + productDetailDTO.getColorId() + " Not found ");
            });
            if (productDetailDTO.getId() != null){
                ProductDetail productDetail = productDetailRepository.findById(productDetailDTO.getId()).orElseThrow(() -> {
                    return new DataNotFoundException("Product detail with id " + productDetailDTO.getId() + " Not found ");
                });
            productDetail.setActive(productDetailDTO.isActive());
            productDetail.setColor(color);
            productDetail.setQuantity(productDetailDTO.getQuantity());
            productDetail.setDiscount(productDetailDTO.getDiscount());
            productDetail.setSalePrice(productDetailDTO.getSalePrice());
            return productDetail;
            }
            else{
                ProductDetail productDetail = ProductDetail.builder()
                        .product(product)
                        .color(color)
                        .quantity(productDetailDTO.getQuantity())
                        .discount(productDetailDTO.getDiscount())
                        .salePrice(productDetailDTO.getSalePrice())
                        .build();
                productDetail.setActive(productDetailDTO.isActive());
            }
        return null;
        }).toList();
        List<ProductDetail> savedDetails = productDetailRepository.saveAll(productDetails);
        product.setProductDetails(savedDetails);
        return savedDetails.stream().map(ProductDetailResponse::fromProductDetail).toList();
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
}
