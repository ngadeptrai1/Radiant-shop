package com.backend.cosmetic.service.impl;

import com.backend.cosmetic.dto.ProductDetailDTO;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.model.Color;
import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.model.ProductDetail;
import com.backend.cosmetic.repository.ColorRepository;
import com.backend.cosmetic.repository.ProductDetailRepository;
import com.backend.cosmetic.repository.ProductRepository;
import com.backend.cosmetic.response.ProductDetailResponse;
import com.backend.cosmetic.service.ProductDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductDetailServiceImpl implements ProductDetailService {

    private final ProductDetailRepository productDetailRepository;
    private final ColorRepository colorRepository;
    private final ProductRepository productRepository;

    @Override
    public ProductDetailResponse save(ProductDetailDTO productDetailDTO) {
        Product product = productRepository.findById(productDetailDTO.getProductId()).orElseThrow(() -> {
            return new DataNotFoundException("Product with id "+productDetailDTO.getProductId() + " Not found ");
        });
        Color color = colorRepository.findById(productDetailDTO.getColorId()).orElseThrow(() -> {
            return new DataNotFoundException("Color with id "+productDetailDTO.getColorId() + " Not found ");
        });
        ProductDetail productDetail = ProductDetail.builder()
                .product(product)
                .color(color)
                .discount(productDetailDTO.getDiscount())
                .salePrice(productDetailDTO.getSalePrice())
                .build();
        return ProductDetailResponse.fromProductDetail(productDetailRepository.save(productDetail));
    }

    @Override
    public ProductDetailResponse update(ProductDetailDTO productDetailDTO,long id) {

        Color color = colorRepository.findById(productDetailDTO.getColorId()).orElseThrow(() -> {
            return new DataNotFoundException("Color with id "+productDetailDTO.getColorId() + " Not found ");
        });
        ProductDetail productDetail = productDetailRepository.findById(id).orElseThrow(() -> {
            return new DataNotFoundException("Product detail with id "+id + " Not found ");
        });

         productDetail .setColor(color);
         productDetail.setDiscount(productDetailDTO.getDiscount());
         productDetail.setSalePrice(productDetailDTO.getSalePrice());
        return ProductDetailResponse.fromProductDetail(productDetailRepository.save(productDetail));
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
