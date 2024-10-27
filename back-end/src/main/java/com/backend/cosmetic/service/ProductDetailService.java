package com.backend.cosmetic.service;

import com.backend.cosmetic.dto.ProductDetailDTO;
import com.backend.cosmetic.model.ProductDetail;
import com.backend.cosmetic.response.ProductDetailResponse;
import org.springframework.stereotype.Service;

@Service
public interface ProductDetailService {
    ProductDetailResponse save(ProductDetailDTO productDetailDTO);
    ProductDetailResponse update(ProductDetailDTO productDetailDTO,long id);
    ProductDetailResponse delete(Long id);
    ProductDetailResponse findById(Long id);

}
