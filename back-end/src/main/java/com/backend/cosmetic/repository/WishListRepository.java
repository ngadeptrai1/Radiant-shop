package com.backend.cosmetic.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.model.WishList;

@Repository
public interface WishListRepository extends JpaRepository<WishList, Long> {
    List<WishList> findByUserIdAndActiveTrue(Long userId);
    Optional<WishList> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    @Query("SELECT p FROM Product p JOIN WishList w ON p.id = w.product.id "
    +"join Brand b on p.brand.id = b.id "
    +"join Category c on p.category.id = c.id "
    +"WHERE w.user.id = :userId AND w.active = true AND p.active = true AND b.active = true AND c.active = true")
    List<Product> findProductByUserIdAndActiveTrue(@Param("userId") Long userId);
} 