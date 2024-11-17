package com.backend.cosmetic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.cosmetic.model.ProductImage;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findAllByProductId(Long id);
}
