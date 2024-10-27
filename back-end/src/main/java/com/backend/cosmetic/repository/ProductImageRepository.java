package com.backend.cosmetic.repository;

import com.backend.cosmetic.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, String> {

    List<ProductImage> findAllByProductId(Long id);
}
