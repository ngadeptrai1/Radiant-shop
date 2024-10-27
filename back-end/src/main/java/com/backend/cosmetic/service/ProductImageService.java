package com.backend.cosmetic.service;

import com.backend.cosmetic.model.ProductImage;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProductImageService {
    ProductImage save (ProductImage productImage );
    List<ProductImage> findByProductId(Long id);
    List<ProductImage> saveAll(List<ProductImage> list);
}
