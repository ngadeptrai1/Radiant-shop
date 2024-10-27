package com.backend.cosmetic.service.impl;


import com.backend.cosmetic.model.ProductImage;
import com.backend.cosmetic.repository.ProductImageRepository;
import com.backend.cosmetic.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {
    private final ProductImageRepository productImageRepository;
    @Override
    public ProductImage save(ProductImage productImage) {
        return productImageRepository.save(productImage);
    }

    @Override
    public List<ProductImage> findByProductId(Long id) {
        return productImageRepository.findAllByProductId(id);
    }

    @Override
    public List<ProductImage> saveAll(List<ProductImage> list) {
        return productImageRepository.saveAll(list);
    }
}
