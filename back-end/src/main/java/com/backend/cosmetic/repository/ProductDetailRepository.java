package com.backend.cosmetic.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cosmetic.dto.ProductDetailProjection;
import com.backend.cosmetic.model.ProductDetail;

@Repository
public interface ProductDetailRepository extends JpaRepository<ProductDetail, Long> {

@Query("SELECT pd FROM ProductDetail pd WHERE pd.product.active = true AND pd.product.brand.active = true AND pd.product.category.active = true AND pd.color.active = true AND pd.quantity > 0")
List<ProductDetail> findActiveProductDetailsWithStock();


    @Query(nativeQuery = true, value = """
       SELECT
           pd.id AS id,
           pd.sale_price AS salePrice,
           pd.discount AS discount,
           pd.quantity AS quantity,
           c.name AS color,
           p.name AS productName,
           p.active AS active,
           p.thumbnail AS thumbnail,
            pd.id as productDetailId
       FROM
           product_details pd
               JOIN
           products p ON pd.product_id = p.id
               LEFT JOIN
           colors c ON pd.color_id = c.id
       WHERE
           pd.active = true AND p.active = true AND c.active = true
         AND pd.quantity > 0
    """)
    List<ProductDetailProjection> findAllProductDetails();
    @Query(nativeQuery = true, value = """
       SELECT
           pd.id AS id,
           pd.sale_price AS salePrice,
           pd.discount AS discount,
           pd.quantity AS quantity,
           c.name AS color,
           p.name AS productName,
           p.active AS active,
           p.thumbnail AS thumbnail,
           pd.id as productDetailId
       FROM
           product_details pd
               JOIN
           products p ON pd.product_id = p.id
               LEFT JOIN
           colors c ON pd.color_id = c.id
       WHERE
          p.id = :productId
    """)
    List<ProductDetailProjection> findAllProductDetailsByProductId(@Param("productId") Long productId);
}
