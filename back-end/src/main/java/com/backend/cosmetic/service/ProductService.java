package com.backend.cosmetic.service;

import com.backend.cosmetic.dto.ProductDTO;
import com.backend.cosmetic.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public interface ProductService {
    ProductResponse saveProduct(ProductDTO product  ) throws IOException;
    ProductResponse updateProduct(ProductDTO product , Long id);
    Page<ProductResponse> findAll (Map<String, Object> filterCriteria, Pageable pageable);
//    Page<ProductResponse> productShop (Pageable pageable,String cateName,String brandName,);
    ProductResponse findById(Long id);
    List<ProductResponse> getAllProducts();
    ProductResponse deleteProduct(Long id);
}
