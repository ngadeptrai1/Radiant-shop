package com.backend.cosmetic.service;

import java.io.IOException;
import java.util.List;

import com.backend.cosmetic.response.ProductDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.ProductDTO;
import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.response.ProductResponse;
import com.backend.cosmetic.dto.ProductProjection;
@Service
public interface ProductService {
    ProductResponse saveProduct(ProductDTO product  ) throws IOException;
    ProductResponse updateProduct(ProductDTO product , Long id);
    Page<ProductResponse> findAll (
        List<Integer> categoryIds,
        List<Long> brandIds,
        String name,
        Double minPrice,
        Double maxPrice,
        Boolean active,
        String sort,
        String direction,
        Pageable pageable
    );
//    Page<ProductResponse> productShop (Pageable pageable,String cateName,String brandName,);
    ProductResponse findById(Long id);
    List<ProductProjection> getAllProducts();
    ProductResponse deleteProduct(Long id);
    List<ProductResponse> searchProductsByName(String name);
    Page<Product> findProductsByCategoryAndSubcategories(Integer categoryId,Pageable pageable);

    List<ProductDetailResponse> getAllProductDetails();
}
