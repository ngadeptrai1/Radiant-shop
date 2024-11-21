package com.backend.cosmetic.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.response.ProductResponse;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
    List<Product> findByNameContainingIgnoreCase(String name);
//
//    @Query("SELECT new com.backend.cosmetic.response.ProductResponse(" +
//           "p.id, p.name, p.description, p.active, p.thumbnail, " +
//           "p.category.id, p.brand.id) " +
//           "FROM Product p")
//    Page<ProductResponse> findAllProductsWithProjection(Pageable pageable);

}
