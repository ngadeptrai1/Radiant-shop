package com.backend.cosmetic.service;

import java.util.List;

import com.backend.cosmetic.dto.ProductDetailProjection;
import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.ProductDetailDTO;
import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.response.ProductDetailResponse;

@Service
public interface ProductDetailService {
   List<ProductDetailResponse> save(List<ProductDetailDTO> productDetailDTO, Product product );
    List<ProductDetailResponse> update(List<ProductDetailDTO> productDetailDTO, Product product);
    ProductDetailResponse delete(Long id);
    ProductDetailResponse findById(Long id);
    Integer plusQuantity(Long id);
    Integer minusQuantity(Long id);
    void refillQuantity(Long id, int amount);
    Integer minusInPos(Long id, int amount);
    List<ProductDetailProjection> findByProductId(Long id);
}
